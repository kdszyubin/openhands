/**
 * 游戏主逻辑模块
 * 控制游戏流程、状态管理和UI交互
 */

import { sortCards } from './card.js';
import { Deck } from './deck.js';
import { RulesAnalyzer, CARD_TYPES, CARD_TYPE_NAMES } from './rules.js';
import { HumanPlayer, AIPlayer, PLAYER_ROLE } from './player.js';
import { SmartAIPlayer } from './smart-ai-player.js';
import { DragSelectionManager, CardDragManager } from './drag-selection.js';
import { animationManager } from './animation.js';
import { soundManager } from './sound.js';

// 游戏阶段
export const GAME_PHASE = {
    IDLE: 'idle',           // 等待开始
    DEALING: 'dealing',     // 发牌中
    BIDDING: 'bidding',     // 叫地主阶段
    PLAYING: 'playing',     // 出牌阶段
    ENDED: 'ended'          // 游戏结束
};

/**
 * 游戏控制器
 */
export class GameController {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.landlordCards = [];
        this.currentPlayerIndex = 0;
        this.phase = GAME_PHASE.IDLE;
        this.lastPlay = null;           // 上一手牌
        this.lastPlayerId = null;       // 上一手牌的玩家ID
        this.passCount = 0;             // 连续不出计数
        this.currentBid = 0;            // 当前最高叫分
        this.bidderIndex = -1;          // 当前叫分最高的玩家索引
        this.bidRound = 0;              // 叫分轮数
        this.multiplier = 1;            // 倍数
        this.isSpring = true;           // 春天判定
        this.landlordPlayCount = 0;     // 地主出牌次数
        this.farmerPlayCount = 0;       // 农民出牌次数
        this.baseScore = 10;            // 基础分
        
        // 拖拽选择管理器
        this.dragSelectionManager = null;
        this.cardDragManager = null;
        
        // UI元素引用
        this.elements = {};
        
        // 回调函数
        this.onStateChange = null;

        // WebSocket for multiplayer
        this.socket = null;
        this.playerId = null;
        this.isMultiplayer = false;
    }

    /**
     * Connect to multiplayer server
     */
    connectMultiplayer() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.socket = new WebSocket(`${protocol}//${window.location.host}`);
        
        this.socket.onopen = () => {
            console.log('Connected to multiplayer server');
            this.isMultiplayer = true;
            animationManager.showMessage(this.elements.centerArea, '已连接服务器，等待其他玩家...', 2000);
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleNetworkMessage(data);
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from multiplayer server');
            this.isMultiplayer = false;
        };
        
        this.socket.onerror = (err) => {
            console.error('WebSocket error:', err);
            // Fallback to single player mode silently or notify user
        };
    }

    /**
     * Handle messages from server
     */
    handleNetworkMessage(data) {
        console.log('Received:', data);
        switch(data.type) {
            case 'init':
                this.playerId = data.playerId;
                console.log('My Player ID:', this.playerId);
                break;
            case 'player_join':
                animationManager.showMessage(this.elements.centerArea, `${data.player.name} 加入游戏`, 1000);
                break;
            case 'game_start':
                this.startGame();
                break;
            // Handle other game events
        }
    }

    /**
     * 初始化游戏
     */
    init() {
        // 创建玩家
        this.players = [
            new SmartAIPlayer(0, '电脑A', 'hard'),
            new HumanPlayer(1, '玩家'),
            new SmartAIPlayer(2, '电脑B', 'hard')
        ];

        // 获取UI元素引用
        this.cacheElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化音效
        soundManager.init();

        // 更新初始积分显示
        this.updateScoreDisplay();

        // 尝试连接服务器
        this.connectMultiplayer();

        // 初始化拖拽选择功能
        this.dragSelectionManager = new DragSelectionManager(this);
        this.cardDragManager = new CardDragManager(this);

        console.log('Game initialized');
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            gameTable: document.getElementById('game-table'),
            centerArea: document.getElementById('center-area'),
            landlordCards: document.getElementById('landlord-cards'),
            myCards: document.getElementById('my-cards'),
            gameInfo: document.getElementById('game-info'),
            currentTurn: document.getElementById('current-turn'),
            gameMultiplier: document.getElementById('game-multiplier'),
            
            // 玩家区域
            playerLeft: document.getElementById('player-left'),
            playerRight: document.getElementById('player-right'),
            playerBottom: document.getElementById('player-bottom'),
            
            // 出牌展示区
            leftPlayed: document.getElementById('left-played'),
            centerPlayed: document.getElementById('center-played'),
            rightPlayed: document.getElementById('right-played'),
            
            // 按钮组
            startButtons: document.getElementById('start-buttons'),
            bidButtons: document.getElementById('bid-buttons'),
            playButtons: document.getElementById('play-buttons'),
            
            // 按钮
            btnStart: document.getElementById('btn-start'),
            btnNoBid: document.getElementById('btn-no-bid'),
            btnBid1: document.getElementById('btn-bid-1'),
            btnBid2: document.getElementById('btn-bid-2'),
            btnBid3: document.getElementById('btn-bid-3'),
            btnHint: document.getElementById('btn-hint'),
            btnPass: document.getElementById('btn-pass'),
            btnPlay: document.getElementById('btn-play'),
            btnRestart: document.getElementById('btn-restart'),
            
            // 音效按钮
            btnBgm: document.getElementById('btn-bgm'),
            btnSfx: document.getElementById('btn-sfx'),
            
            // 弹窗
            resultModal: document.getElementById('result-modal'),
            resultIcon: document.getElementById('result-icon'),
            resultTitle: document.getElementById('result-title'),
            resultInfo: document.getElementById('result-info')
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 开始游戏按钮
        this.elements.btnStart.addEventListener('click', () => this.startGame());
        this.elements.btnRestart.addEventListener('click', () => {
            this.elements.resultModal.classList.add('hidden');
            this.startGame();
        });

        // 叫分按钮
        this.elements.btnNoBid.addEventListener('click', () => this.handleBid(0));
        this.elements.btnBid1.addEventListener('click', () => this.handleBid(1));
        this.elements.btnBid2.addEventListener('click', () => this.handleBid(2));
        this.elements.btnBid3.addEventListener('click', () => this.handleBid(3));

        // 出牌按钮
        this.elements.btnHint.addEventListener('click', () => this.showHint());
        this.elements.btnPass.addEventListener('click', () => this.handlePass());
        this.elements.btnPlay.addEventListener('click', () => this.handlePlay());

        // 音效按钮
        this.elements.btnBgm.addEventListener('click', () => {
            const enabled = soundManager.toggleBGM();
            this.elements.btnBgm.classList.toggle('active', enabled);
        });
        
        this.elements.btnSfx.addEventListener('click', () => {
            const enabled = soundManager.toggleSFX();
            this.elements.btnSfx.classList.toggle('active', enabled);
        });
    }

    /**
     * 开始新游戏
     */
    async startGame() {
        console.log('Starting new game...');
        
        // 重置状态
        this.resetGame();
        
        // 隐藏开始按钮
        this.elements.startButtons.classList.add('hidden');
        
        // 发牌
        await this.dealCards();
        
        // 进入叫分阶段
        this.startBidding();
    }

    /**
     * 重置游戏状态
     */
    resetGame() {
        this.deck.reset();
        // 保留玩家积分，重置其他状态
        this.players.forEach(p => p.reset(false));
        this.landlordCards = [];
        this.currentPlayerIndex = Math.floor(Math.random() * 3); // 随机起始玩家
        this.phase = GAME_PHASE.IDLE;
        this.lastPlay = null;
        this.lastPlayerId = null;
        this.passCount = 0;
        this.currentBid = 0;
        this.bidderIndex = -1;
        this.bidRound = 0;
        this.multiplier = 1;
        this.isSpring = true;
        this.landlordPlayCount = 0;
        this.farmerPlayCount = 0;

        // 清理UI
        this.clearAllPlayedCards();
        this.updateMultiplierDisplay();
        this.updateScoreDisplay(); // 确保积分显示正确
        
        // 移除地主标识
        document.querySelectorAll('.is-landlord').forEach(el => {
            el.classList.remove('is-landlord');
            const crown = el.querySelector('.landlord-crown');
            if (crown) crown.remove();
        });

        // 清理动画
        animationManager.cleanup();
    }

    /**
     * 发牌
     */
    async dealCards() {
        this.phase = GAME_PHASE.DEALING;
        this.updateCurrentTurn('发牌中...');

        const { hands, landlordCards } = this.deck.deal();
        this.landlordCards = landlordCards;

        // 分配手牌
        this.players[0].setCards(hands[0]);
        this.players[1].setCards(hands[1]);
        this.players[2].setCards(hands[2]);

        // 渲染底牌（背面）
        this.renderLandlordCards(false);

        // 渲染AI手牌数量
        this.updateAICardCount(0);
        this.updateAICardCount(2);

        // 渲染玩家手牌
        await this.renderPlayerCards();

        soundManager.playDeal();
    }

    /**
     * 渲染底牌
     */
    renderLandlordCards(faceUp = false) {
        this.elements.landlordCards.innerHTML = '';
        this.landlordCards.forEach(card => {
            const cardEl = card.createElement(faceUp);
            this.elements.landlordCards.appendChild(cardEl);
        });
    }

    /**
     * 渲染玩家手牌
     */
    async renderPlayerCards() {
        const player = this.players[1]; // 人类玩家
        this.elements.myCards.innerHTML = '';

        const cards = player.hand.cards;
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardEl = card.createElement(true);
            cardEl.style.marginLeft = i > 0 ? '-40px' : '0';
            cardEl.style.zIndex = i;
            
            // 点击选牌 - 保持原有功能
            cardEl.addEventListener('click', (e) => {
                // 如果是拖拽操作后的点击，可能需要忽略
                if (this.dragSelectionManager?.isDragging) {
                    return;
                }
                
                if (this.phase !== GAME_PHASE.PLAYING || this.currentPlayerIndex !== 1) {
                    return;
                }
                player.toggleCard(card.id);
                soundManager.playSelect();
                this.updateCardSelection();
            });

            this.elements.myCards.appendChild(cardEl);
        }

        // 发牌动画
        const cardElements = this.elements.myCards.querySelectorAll('.card');
        await animationManager.dealCards(cardElements, 30);
    }

    /**
     * 更新牌的选中状态
     */
    updateCardSelection() {
        const player = this.players[1];
        const cardElements = this.elements.myCards.querySelectorAll('.card');
        
        cardElements.forEach(el => {
            const cardId = el.dataset.cardId;
            const card = player.hand.cards.find(c => c.id === cardId);
            if (card) {
                animationManager.selectCardAnimation(el, card.selected);
            }
        });
    }

    /**
     * 更新AI手牌数量显示
     */
    updateAICardCount(playerIndex) {
        const player = this.players[playerIndex];
        const element = playerIndex === 0 ? this.elements.playerLeft : this.elements.playerRight;
        const countEl = element.querySelector('.card-count');
        countEl.textContent = `${player.cardCount}张`;

        // 更新背面牌显示
        const cardsEl = element.querySelector('.player-cards');
        cardsEl.innerHTML = '';
        
        // 最多显示5张背面牌
        const displayCount = Math.min(player.cardCount, 5);
        for (let i = 0; i < displayCount; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card face-down small';
            cardBack.innerHTML = '<div class="card-back-pattern"></div>';
            cardBack.style.marginLeft = i > 0 ? '-35px' : '0';
            cardsEl.appendChild(cardBack);
        }
    }

    /**
     * 开始叫分阶段
     */
    startBidding() {
        this.phase = GAME_PHASE.BIDDING;
        this.bidRound = 0;
        this.currentBid = 0;
        this.bidderIndex = -1;

        // 从随机玩家开始叫分
        this.processBidTurn();
    }

    /**
     * 处理叫分回合
     */
    async processBidTurn() {
        const player = this.players[this.currentPlayerIndex];
        
        this.updateCurrentTurn(`${player.name} 叫分中...`);

        if (player.type === 'human') {
            // 人类玩家，显示叫分按钮
            this.showBidButtons();
        } else {
            // AI玩家
            await player.think();
            // 设置玩家访问其他玩家信息的途径
            player.players = this.players;
            const bid = player.decideBid(this.currentBid, this.landlordCards);
            await this.processBid(bid);
        }
    }

    /**
     * 显示叫分按钮
     */
    showBidButtons() {
        this.elements.bidButtons.classList.remove('hidden');
        
        // 根据当前最高分禁用按钮
        this.elements.btnBid1.disabled = this.currentBid >= 1;
        this.elements.btnBid2.disabled = this.currentBid >= 2;
        this.elements.btnBid3.disabled = this.currentBid >= 3;
    }

    /**
     * 隐藏叫分按钮
     */
    hideBidButtons() {
        this.elements.bidButtons.classList.add('hidden');
    }

    /**
     * 处理玩家叫分
     */
    handleBid(score) {
        if (this.phase !== GAME_PHASE.BIDDING || this.currentPlayerIndex !== 1) {
            return;
        }
        
        this.hideBidButtons();
        this.processBid(score);
    }

    /**
     * 处理叫分结果
     */
    async processBid(score) {
        const player = this.players[this.currentPlayerIndex];
        player.lastBid = score;

        // 显示叫分动作
        const actionContainer = this.getPlayerActionContainer(this.currentPlayerIndex);
        const actionText = score === 0 ? '不叫' : `${score}分`;
        await animationManager.showPlayerAction(actionContainer, actionText, 'bid');
        
        soundManager.speakBid(score);

        if (score > this.currentBid) {
            this.currentBid = score;
            this.bidderIndex = this.currentPlayerIndex;
            this.multiplier = score;
        }

        this.bidRound++;

        // 检查叫分是否结束
        // 如果叫了3分直接结束，或者一轮叫完了
        if (this.currentBid === 3 || this.bidRound >= 3) {
            this.endBidding();
        } else {
            // 下一个玩家叫分
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
            setTimeout(() => this.processBidTurn(), 1000);
        }
    }

    /**
     * 结束叫分阶段
     */
    async endBidding() {
        // 如果没人叫分，重新发牌
        if (this.bidderIndex === -1) {
            await animationManager.showMessage(this.elements.centerArea, '没有人叫地主，重新发牌', 2000);
            this.startGame();
            return;
        }

        // 设置地主
        const landlord = this.players[this.bidderIndex];
        landlord.setRole(PLAYER_ROLE.LANDLORD);
        landlord.addCards(this.landlordCards);

        // 设置农民
        this.players.forEach((p, i) => {
            if (i !== this.bidderIndex) {
                p.setRole(PLAYER_ROLE.FARMER);
            }
        });

        // 更新UI
        this.updateRoleDisplay();
        
        // 显示底牌
        this.renderLandlordCards(true);
        await animationManager.showMessage(this.elements.centerArea, `${landlord.name} 成为地主！`, 1500);

        // 高亮地主
        const landlordElement = this.getPlayerElement(this.bidderIndex);
        animationManager.highlightLandlord(landlordElement);

        // 如果地主是玩家，重新渲染手牌
        if (this.bidderIndex === 1) {
            await this.renderPlayerCards();
        } else {
            this.updateAICardCount(this.bidderIndex);
        }

        // 清除叫分动作显示
        this.clearAllActions();
        
        // 开始出牌阶段（地主先出）
        this.currentPlayerIndex = this.bidderIndex;
        this.startPlaying();
    }

    /**
     * 更新角色显示
     */
    updateRoleDisplay() {
        this.players.forEach((player, index) => {
            const element = this.getPlayerElement(index);
            const roleEl = element.querySelector('.player-role');
            if (player.isLandlord) {
                roleEl.textContent = '👑 地主';
                roleEl.className = 'player-role landlord';
            } else {
                roleEl.textContent = '🌾 农民';
                roleEl.className = 'player-role farmer';
            }
        });
        
        this.updateMultiplierDisplay();
    }

    /**
     * 更新倍数显示
     */
    updateMultiplierDisplay() {
        this.elements.gameMultiplier.textContent = `倍数: ${this.multiplier}`;
    }

    /**
     * 开始出牌阶段
     */
    startPlaying() {
        this.phase = GAME_PHASE.PLAYING;
        this.lastPlay = null;
        this.lastPlayerId = null;
        this.passCount = 0;

        this.processPlayTurn();
    }

    /**
     * 处理出牌回合
     */
    async processPlayTurn() {
        const player = this.players[this.currentPlayerIndex];
        
        this.updateCurrentTurn(`${player.name} 出牌中...`);

        // 清除上轮的出牌显示（如果连续两人不出）
        if (this.passCount >= 2) {
            this.clearAllPlayedCards();
            this.lastPlay = null;
            this.lastPlayerId = null;
            this.passCount = 0;
        }

        if (player.type === 'human') {
            // 人类玩家
            this.showPlayButtons();
        } else {
            // AI玩家
            await player.think();
            // 设置玩家访问其他玩家信息的途径
            player.players = this.players;
            const mustPlay = (this.lastPlayerId === null || this.lastPlayerId === player.id);
            const cards = player.decidePlay(this.lastPlay, mustPlay);
            
            if (cards) {
                await this.processPlay(cards);
            } else {
                await this.processPassPlay();
            }
        }
    }

    /**
     * 显示出牌按钮
     */
    showPlayButtons() {
        this.elements.playButtons.classList.remove('hidden');
        
        // 判断是否可以不出
        const canPass = this.lastPlay && this.lastPlayerId !== this.players[1].id;
        this.elements.btnPass.disabled = !canPass;
    }

    /**
     * 隐藏出牌按钮
     */
    hidePlayButtons() {
        this.elements.playButtons.classList.add('hidden');
    }

    /**
     * 显示提示
     */
    showHint() {
        if (this.phase !== GAME_PHASE.PLAYING || this.currentPlayerIndex !== 1) {
            return;
        }

        const player = this.players[1];
        player.clearSelection();

        const hint = player.getHint(this.lastPlay);
        
        if (hint && hint.length > 0) {
            hint.forEach(card => {
                player.toggleCard(card.id);
            });
            this.updateCardSelection();
            soundManager.playClick();
        } else {
            animationManager.showMessage(this.elements.centerArea, '没有能出的牌', 1000);
        }
    }

    /**
     * 处理不出
     */
    async handlePass() {
        if (this.phase !== GAME_PHASE.PLAYING || this.currentPlayerIndex !== 1) {
            return;
        }

        // 检查是否可以不出
        if (!this.lastPlay || this.lastPlayerId === this.players[1].id) {
            animationManager.showMessage(this.elements.centerArea, '你必须出牌', 1000);
            return;
        }

        this.hidePlayButtons();
        this.players[1].clearSelection();
        this.updateCardSelection();
        
        await this.processPassPlay();
    }

    /**
     * 处理出牌
     */
    async handlePlay() {
        if (this.phase !== GAME_PHASE.PLAYING || this.currentPlayerIndex !== 1) {
            return;
        }

        const player = this.players[1];
        const selected = player.getSelectedCards();

        if (selected.length === 0) {
            animationManager.showMessage(this.elements.centerArea, '请选择要出的牌', 1000);
            return;
        }

        // 验证牌型
        const result = RulesAnalyzer.isValidPlay(selected, this.lastPlay);
        
        if (!result.valid) {
            animationManager.showMessage(this.elements.centerArea, result.reason, 1000);
            return;
        }

        this.hidePlayButtons();
        await this.processPlay(selected);
    }

    /**
     * 处理出牌逻辑
     */
    async processPlay(cards) {
        const player = this.players[this.currentPlayerIndex];
        
        // 分析牌型
        const analysis = RulesAnalyzer.analyze(cards);
        
        // 出牌
        player.playCards(cards);
        player.clearSelection();

        // 更新春天判定
        if (player.isLandlord) {
            this.landlordPlayCount++;
        } else {
            this.farmerPlayCount++;
            if (this.farmerPlayCount > 0) {
                this.isSpring = false;
            }
        }

        // 更新上一手牌
        this.lastPlay = analysis;
        this.lastPlayerId = player.id;
        this.passCount = 0;

        // 播放音效和特效
        if (analysis.type === CARD_TYPES.ROCKET) {
            this.multiplier *= 2;
            this.updateMultiplierDisplay();
            soundManager.speakRocket();
            await animationManager.rocketEffect(this.elements.centerArea);
        } else if (analysis.type === CARD_TYPES.BOMB) {
            this.multiplier *= 2;
            this.updateMultiplierDisplay();
            soundManager.speakBomb();
            await animationManager.bombEffect(this.elements.centerArea);
        } else {
            soundManager.playCard();
        }

        // 记录AI出牌到记忆中（如果是AI玩家）
        if (player.type === 'ai' && typeof player.rememberOpponentPlay === 'function') {
            // 告诉其他AI玩家这张牌是谁出的
            for (const otherPlayer of this.players) {
                if (otherPlayer.id !== player.id && typeof otherPlayer.rememberOpponentPlay === 'function') {
                    otherPlayer.rememberOpponentPlay(player.id, cards);
                }
            }
        }

        // 显示出的牌
        await this.showPlayedCards(this.currentPlayerIndex, cards, analysis);

        // 更新手牌显示
        if (this.currentPlayerIndex === 1) {
            await this.renderPlayerCards();
        } else {
            this.updateAICardCount(this.currentPlayerIndex);
        }

        // 检查是否获胜
        if (player.hasWon) {
            this.endGame(player);
            return;
        }

        // 下一个玩家
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
        setTimeout(() => this.processPlayTurn(), 800);
    }

    /**
     * 处理不出牌
     */
    async processPassPlay() {
        const player = this.players[this.currentPlayerIndex];
        
        this.passCount++;

        // 记录AI不出牌到记忆中
        if (player.type === 'ai' && typeof player.rememberOpponentPlay === 'function') {
            // 通知其他AI玩家该玩家选择了pass
            for (const otherPlayer of this.players) {
                if (otherPlayer.id !== player.id && typeof otherPlayer.rememberOpponentPlay === 'function') {
                    // 使用特殊标识表示pass
                    otherPlayer.rememberOpponentPlay(player.id, []);
                }
            }
        }

        // 显示不出
        const actionContainer = this.getPlayerActionContainer(this.currentPlayerIndex);
        await animationManager.showPlayerAction(actionContainer, '不出', 'pass');
        soundManager.speakPass();

        // 下一个玩家
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
        setTimeout(() => this.processPlayTurn(), 800);
    }

    /**
     * 显示出的牌
     */
    async showPlayedCards(playerIndex, cards, analysis) {
        const container = this.getPlayedCardsContainer(playerIndex);
        container.innerHTML = '';

        // 创建牌组容器
        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'played-cards-wrapper';

        cards.forEach((card, i) => {
            const cardEl = card.createElement(true);
            cardEl.classList.add('played');
            cardEl.style.marginLeft = i > 0 ? '-30px' : '0';
            cardsWrapper.appendChild(cardEl);
        });

        container.appendChild(cardsWrapper);

        // 显示牌型名称
        const typeName = CARD_TYPE_NAMES[analysis.type];
        if (typeName && analysis.type !== CARD_TYPES.SINGLE && analysis.type !== CARD_TYPES.PAIR) {
            const typeLabel = document.createElement('div');
            typeLabel.className = 'card-type-label';
            typeLabel.textContent = typeName;
            container.appendChild(typeLabel);
        }
    }

    /**
     * 更新积分显示
     */
    updateScoreDisplay() {
        this.players.forEach((player, index) => {
            const element = this.getPlayerElement(index);
            const scoreEl = element.querySelector('.player-score');
            if (scoreEl) {
                scoreEl.textContent = `💰 ${player.score}`;
            }
        });
    }

    /**
     * 结算积分
     */
    calculateScores(winner) {
        const isLandlordWin = winner.isLandlord;
        const totalMultiplier = this.multiplier;
        const baseScore = this.baseScore;
        
        // 计算地主输赢分
        let landlordScore = baseScore * totalMultiplier;
        
        // 更新分数
        this.players.forEach(player => {
            if (player.isLandlord) {
                // 地主
                const delta = isLandlordWin ? (landlordScore * 2) : -(landlordScore * 2);
                player.updateScore(delta);
            } else {
                // 农民
                const delta = isLandlordWin ? -landlordScore : landlordScore;
                player.updateScore(delta);
            }
        });
        
        this.updateScoreDisplay();
        return isLandlordWin ? (landlordScore * 2) : landlordScore; // 返回赢家赢的分数
    }

    /**
     * 游戏结束
     */
    async endGame(winner) {
        this.phase = GAME_PHASE.ENDED;
        
        const isPlayerWin = winner.id === 1;
        const isLandlordWin = winner.isLandlord;
        
        // 判断是否春天
        let springText = '';
        if (this.isSpring && isLandlordWin) {
            // 地主春天（农民没出过牌）
            springText = '（春天！）';
            this.multiplier *= 2;
            soundManager.speakSpring();
        } else if (!isLandlordWin && this.landlordPlayCount === 1) {
            // 反春天（地主只出了一手牌）
            springText = '（反春天！）';
            this.multiplier *= 2;
            soundManager.speakSpring();
        }

        // 播放胜利/失败动画
        animationManager.victoryAnimation(this.elements.gameTable, isPlayerWin);
        soundManager.speakResult(isPlayerWin);

        // 结算积分
        const scoreChange = this.calculateScores(winner);

        // 显示结果弹窗
        await this.wait(500);
        this.showResultModal(isPlayerWin, isLandlordWin, springText, scoreChange);
    }

    /**
     * 显示结果弹窗
     */
    showResultModal(isPlayerWin, isLandlordWin, springText, scoreChange) {
        this.elements.resultIcon.textContent = isPlayerWin ? '🎉' : '😢';
        this.elements.resultTitle.textContent = isPlayerWin ? '恭喜获胜！' : '很遗憾，失败了';
        
        const roleText = isLandlordWin ? '地主获胜' : '农民获胜';
        const scoreText = isPlayerWin ? `+${scoreChange}` : `-${scoreChange}`;
        const scoreClass = isPlayerWin ? 'win-score' : 'lose-score';
        
        this.elements.resultInfo.innerHTML = `
            <p>${roleText} ${springText}</p>
            <p>最终倍数: <strong>${this.multiplier}</strong></p>
            <p class="score-result ${scoreClass}">积分变动: ${scoreText}</p>
        `;
        
        this.elements.resultModal.classList.remove('hidden');
    }

    /**
     * 获取玩家元素
     */
    getPlayerElement(playerIndex) {
        switch (playerIndex) {
            case 0: return this.elements.playerLeft;
            case 1: return this.elements.playerBottom;
            case 2: return this.elements.playerRight;
        }
    }

    /**
     * 获取玩家动作显示容器
     */
    getPlayerActionContainer(playerIndex) {
        const element = this.getPlayerElement(playerIndex);
        return element.querySelector('.player-action');
    }

    /**
     * 获取出牌显示容器
     */
    getPlayedCardsContainer(playerIndex) {
        switch (playerIndex) {
            case 0: return this.elements.leftPlayed;
            case 1: return this.elements.centerPlayed;
            case 2: return this.elements.rightPlayed;
        }
    }

    /**
     * 清除所有动作显示
     */
    clearAllActions() {
        document.querySelectorAll('.player-action').forEach(el => {
            el.innerHTML = '';
        });
    }

    /**
     * 清除所有出牌显示
     */
    clearAllPlayedCards() {
        this.elements.leftPlayed.innerHTML = '';
        this.elements.centerPlayed.innerHTML = '';
        this.elements.rightPlayed.innerHTML = '';
    }

    /**
     * 更新当前回合显示
     */
    updateCurrentTurn(text) {
        this.elements.currentTurn.textContent = text;
    }

    /**
     * 等待
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
