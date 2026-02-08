/**
 * 玩家模块
 * 定义玩家数据结构和基本操作
 */

import { sortCards } from './card.js';
import { HandManager } from './deck.js';
import { RulesAnalyzer, CardTypeFinder } from './rules.js';

// 玩家角色
export const PLAYER_ROLE = {
    UNKNOWN: 'unknown',
    LANDLORD: 'landlord',
    FARMER: 'farmer'
};

// 玩家类型
export const PLAYER_TYPE = {
    HUMAN: 'human',
    AI: 'ai'
};

/**
 * 玩家基类
 */
export class Player {
    constructor(id, name, type = PLAYER_TYPE.HUMAN) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.role = PLAYER_ROLE.UNKNOWN;
        this.hand = new HandManager();
        this.lastBid = 0;        // 最后叫的分数
        this.hasPlayed = false;  // 本回合是否出过牌
        this.passCount = 0;      // 连续不出次数
    }

    /**
     * 设置手牌
     */
    setCards(cards) {
        this.hand = new HandManager(sortCards(cards));
        return this;
    }

    /**
     * 添加牌（用于地主获得底牌）
     */
    addCards(cards) {
        this.hand.addCards(cards);
        return this;
    }

    /**
     * 出牌
     */
    playCards(cards) {
        this.hand.removeCards(cards);
        this.hasPlayed = true;
        this.passCount = 0;
        return cards;
    }

    /**
     * 不出牌
     */
    pass() {
        this.passCount++;
        return null;
    }

    /**
     * 获取手牌数量
     */
    get cardCount() {
        return this.hand.count;
    }

    /**
     * 是否已经出完牌
     */
    get hasWon() {
        return this.hand.isEmpty;
    }

    /**
     * 重置玩家状态
     */
    reset() {
        this.role = PLAYER_ROLE.UNKNOWN;
        this.hand = new HandManager();
        this.lastBid = 0;
        this.hasPlayed = false;
        this.passCount = 0;
        return this;
    }

    /**
     * 设置角色
     */
    setRole(role) {
        this.role = role;
        return this;
    }

    /**
     * 是否是地主
     */
    get isLandlord() {
        return this.role === PLAYER_ROLE.LANDLORD;
    }

    /**
     * 获取选中的牌
     */
    getSelectedCards() {
        return this.hand.getSelectedCards();
    }

    /**
     * 清除选中状态
     */
    clearSelection() {
        this.hand.clearSelection();
        return this;
    }

    /**
     * 切换牌的选中状态
     */
    toggleCard(cardId) {
        this.hand.toggleCardSelection(cardId);
        return this;
    }
}

/**
 * 人类玩家类
 */
export class HumanPlayer extends Player {
    constructor(id, name) {
        super(id, name, PLAYER_TYPE.HUMAN);
    }

    /**
     * 验证选中的牌是否可以出
     */
    validateSelection(lastPlay = null) {
        const selected = this.getSelectedCards();
        if (selected.length === 0) {
            return { valid: false, reason: '请选择要出的牌' };
        }
        return RulesAnalyzer.isValidPlay(selected, lastPlay);
    }

    /**
     * 获取提示（找能打过上家的牌）
     */
    getHint(lastPlay = null) {
        const finder = new CardTypeFinder(this.hand.cards);
        
        if (!lastPlay) {
            // 没有上家，提示出最小的单张
            const singles = finder.findSingles();
            if (singles.length > 0) {
                return singles[singles.length - 1]; // 最小的单张
            }
            return null;
        }

        return finder.findBeatable(lastPlay);
    }
}

/**
 * AI玩家类
 */
export class AIPlayer extends Player {
    constructor(id, name, difficulty = 'normal') {
        super(id, name, PLAYER_TYPE.AI);
        this.difficulty = difficulty; // easy, normal, hard
        this.thinkingTime = 1000;     // 思考时间（毫秒）
    }

    /**
     * AI决定是否叫地主
     * @returns {number} 叫的分数 (0-3)
     */
    decideBid(currentBid, landlordCards = []) {
        const hand = this.hand.cards;
        let score = 0;

        // 计算手牌强度
        // 大小王各加3分
        const bigJoker = hand.find(c => c.value === 'JOKER_BIG');
        const smallJoker = hand.find(c => c.value === 'JOKER_SMALL');
        if (bigJoker) score += 3;
        if (smallJoker) score += 2;

        // 2的数量
        const twos = hand.filter(c => c.value === '2');
        score += twos.length * 1.5;

        // 炸弹
        const finder = new CardTypeFinder(hand);
        const bombs = finder.findBombs();
        score += bombs.length * 4;

        // 王炸
        if (bigJoker && smallJoker) score += 5;

        // 根据分数决定叫分
        if (this.difficulty === 'easy') {
            score *= 0.7;
        } else if (this.difficulty === 'hard') {
            score *= 1.2;
        }

        // 添加随机因素
        score += (Math.random() - 0.5) * 2;

        if (score >= 8 && currentBid < 3) return 3;
        if (score >= 5 && currentBid < 2) return 2;
        if (score >= 3 && currentBid < 1) return 1;
        return 0;
    }

    /**
     * AI决定出什么牌
     * @param {Object} lastPlay - 上家出的牌的分析结果
     * @param {boolean} mustPlay - 是否必须出牌
     * @returns {Card[]|null} 要出的牌，null表示不出
     */
    decidePlay(lastPlay = null, mustPlay = false) {
        const finder = new CardTypeFinder(this.hand.cards);

        // 如果没有上家出牌，主动出牌
        if (!lastPlay || mustPlay) {
            return this.decideFirstPlay(finder);
        }

        // 需要跟牌
        const beatable = finder.findBeatable(lastPlay);
        
        if (!beatable) {
            return null; // 没有能打过的牌，不出
        }

        // 根据难度决定是否出牌
        if (this.difficulty === 'easy') {
            // 简单难度有概率不出
            if (Math.random() < 0.3 && !this.shouldPlayBomb(lastPlay)) {
                return null;
            }
        }

        // 检查是否应该保留大牌
        if (this.shouldHoldBigCards(beatable, lastPlay)) {
            return null;
        }

        return beatable;
    }

    /**
     * AI主动出牌策略
     */
    decideFirstPlay(finder) {
        const cards = this.hand.cards;
        
        // 优先出顺子、连对等组合牌
        const straights = finder.findStraights();
        if (straights.length > 0) {
            return straights[straights.length - 1]; // 出最小的顺子
        }

        const straightPairs = finder.findStraightPairs();
        if (straightPairs.length > 0) {
            return straightPairs[straightPairs.length - 1];
        }

        // 出三带
        const tripleWithOne = finder.findTripleWithOne();
        if (tripleWithOne.length > 0) {
            // 选择三张最小的
            tripleWithOne.sort((a, b) => {
                const aWeight = RulesAnalyzer.analyze(a).mainWeight;
                const bWeight = RulesAnalyzer.analyze(b).mainWeight;
                return aWeight - bWeight;
            });
            return tripleWithOne[0];
        }

        // 出对子
        const pairs = finder.findPairs();
        if (pairs.length > 0) {
            // 不出2的对子（除非只剩2）
            const normalPairs = pairs.filter(p => p[0].weight < 15);
            if (normalPairs.length > 0) {
                return normalPairs[normalPairs.length - 1]; // 最小的对子
            }
        }

        // 出单张
        const singles = finder.findSingles();
        if (singles.length > 0) {
            // 不出大小王和2（除非必要）
            const normalSingles = singles.filter(s => s[0].weight < 15);
            if (normalSingles.length > 0) {
                return normalSingles[normalSingles.length - 1]; // 最小的单张
            }
            return singles[singles.length - 1];
        }

        // 最后才出炸弹
        const bombs = finder.findBombs();
        if (bombs.length > 0) {
            return bombs[0];
        }

        return null;
    }

    /**
     * 判断是否应该出炸弹
     */
    shouldPlayBomb(lastPlay) {
        // 如果是对手出的大牌，考虑出炸弹
        return lastPlay.mainWeight >= 14; // A或以上
    }

    /**
     * 判断是否应该保留大牌
     */
    shouldHoldBigCards(beatable, lastPlay) {
        const analysis = RulesAnalyzer.analyze(beatable);
        
        // 如果是炸弹或王炸，看情况出
        if (analysis.type === 'bomb' || analysis.type === 'rocket') {
            // 如果手牌不多了，可以出
            if (this.cardCount <= 5) return false;
            // 如果上家是大牌，出
            if (lastPlay.mainWeight >= 14) return false;
            // 否则有概率保留
            return Math.random() < 0.5;
        }

        return false;
    }

    /**
     * 模拟思考时间
     */
    async think() {
        const time = this.thinkingTime + Math.random() * 500;
        return new Promise(resolve => setTimeout(resolve, time));
    }
}
