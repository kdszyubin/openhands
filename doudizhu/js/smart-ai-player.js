/**
 * 智能AI玩家类
 * 包含更高级的策略和决策算法
 */

import { Player, AIPlayer, PLAYER_ROLE } from './player.js';
import { RulesAnalyzer, CARD_TYPES, CardTypeFinder } from './rules.js';

export class SmartAIPlayer extends AIPlayer {
    constructor(id, name, difficulty = 'hard') {
        super(id, name, difficulty);
        this.players = []; // 引用所有玩家数组
        this.memory = []; // 记住其他玩家出过的牌
        this.strategy = 'normal'; // 当前策略
        this.aggressiveness = 0.5; // 侵略性系数
        this.riskThreshold = 0.3; // 风险阈值
    }

    /**
     * 高级牌力评估
     */
    evaluateHandStrength() {
        const hand = this.hand.cards;
        const evaluation = {
            totalCards: hand.length,
            singles: 0,
            pairs: 0,
            triples: 0,
            bombs: 0,
            rockets: 0,
            highCards: 0, // 大牌计数
            flexibility: 0, // 牌型灵活性
            connectedness: 0 // 牌的连贯性
        };

        // 按权重分组统计
        const weightGroups = {};
        hand.forEach(card => {
            if (!weightGroups[card.weight]) {
                weightGroups[card.weight] = [];
            }
            weightGroups[card.weight].push(card);
        });

        // 计算各类型牌数量
        Object.values(weightGroups).forEach(group => {
            const count = group.length;
            if (count === 1) evaluation.singles++;
            else if (count === 2) evaluation.pairs++;
            else if (count === 3) evaluation.triples++;
            else if (count === 4) evaluation.bombs++;
        });

        // 检查是否有王炸
        const hasSmallJoker = hand.some(c => c.value === 'JOKER_SMALL');
        const hasBigJoker = hand.some(c => c.value === 'JOKER_BIG');
        if (hasSmallJoker && hasBigJoker) evaluation.rockets++;

        // 计算高牌（10以上）
        evaluation.highCards = hand.filter(c => c.weight >= 10).length;

        // 评估连贯性和灵活性
        const sortedWeights = Object.keys(weightGroups).map(Number).sort((a, b) => a - b);
        
        // 计算连续性得分
        let consecutiveCount = 0;
        for (let i = 0; i < sortedWeights.length - 1; i++) {
            if (sortedWeights[i + 1] - sortedWeights[i] === 1) {
                consecutiveCount++;
            }
        }
        evaluation.connectedness = consecutiveCount / Math.max(1, sortedWeights.length);

        // 计算灵活性得分（多种牌型的可能性）
        evaluation.flexibility = this.evaluateFlexibility();

        return evaluation;
    }

    /**
     * 评估牌型灵活性
     */
    evaluateFlexibility() {
        const hand = this.hand.cards;
        let flexibilityScore = 0;

        // 模拟可以组成的各类牌型数量
        const singles = hand.length;
        
        // 计算可能的对子
        const weightCounts = {};
        hand.forEach(card => {
            weightCounts[card.weight] = (weightCounts[card.weight] || 0) + 1;
        });
        
        const pairs = Object.values(weightCounts).filter(count => count >= 2).length;
        const triples = Object.values(weightCounts).filter(count => count >= 3).length;
        
        // 计算可能的顺子
        let straightCount = 0;
        const sortedWeights = Object.keys(weightCounts).map(Number).sort((a, b) => a - b);
        for (let start = 0; start < sortedWeights.length - 4; start++) {
            let consecutive = 1;
            for (let i = start + 1; i < sortedWeights.length; i++) {
                if (sortedWeights[i] === sortedWeights[i - 1] + 1) {
                    consecutive++;
                    if (consecutive >= 5 && sortedWeights[i - 4] >= 3 && sortedWeights[i] <= 14) { // 3-A范围内
                        straightCount++;
                    }
                } else {
                    break;
                }
            }
        }
        
        flexibilityScore = (singles + pairs + triples + straightCount) / hand.length;
        return flexibilityScore;
    }

    /**
     * 更智能的叫分策略
     */
    decideBid(currentBid, landlordCards = []) {
        const strength = this.evaluateHandStrength();
        let score = 0;

        // 基础牌力计算
        score += strength.highCards * 0.5; // 高牌贡献
        score += strength.bombs * 3; // 炸弹权重
        score += strength.rockets * 5; // 王炸权重
        
        // 连贯性加分
        score += strength.connectedness * 2;
        
        // 灵活性加分
        score += strength.flexibility * 3;
        
        // 农民牌数量计算
        const farmerCards = strength.singles + strength.pairs + strength.triples;
        if (farmerCards > 8) {
            score += 1; // 多农民牌意味着可以灵活出牌
        }

        // 根据难度调整
        if (this.difficulty === 'easy') {
            score *= 0.7;
        } else if (this.difficulty === 'hard') {
            score *= 1.15;
        }
        
        // 调整侵略性
        score *= (0.8 + this.aggressiveness * 0.4); // 在0.8-1.2之间调整

        // 添加一些随机性避免过于规律
        score += (Math.random() - 0.5) * 1.5;

        // 决定叫分
        if (score >= 10 && currentBid < 3) return 3;
        if (score >= 7 && currentBid < 2) return 2;
        if (score >= 4 && currentBid < 1) return 1;
        return 0;
    }

    /**
     * 评估当前局势的安全性
     */
    evaluateSituation(opponentsCards) {
        // 计算对手剩余总牌数
        const totalOpponentCards = opponentsCards.reduce((sum, count) => sum + count, 0);
        
        // 评估风险等级
        if (totalOpponentCards <= 5) {
            // 对手快赢了，采取冒险策略
            return { riskLevel: 'high', strategy: 'aggressive' };
        } else if (this.hand.count <= 5) {
            // 自己快赢了，保守策略
            return { riskLevel: 'low', strategy: 'conservative' };
        } else {
            // 正常局况
            return { riskLevel: 'medium', strategy: 'balanced' };
        }
    }

    /**
     * 更智能的出牌策略
     */
    decidePlay(lastPlay = null, mustPlay = false) {
        const finder = new CardTypeFinder(this.hand.cards);
        
        // 评估当前局势
        const opponentCards = this.players.filter(p => p.id !== this.id).map(p => p.cardCount);
        const situation = this.evaluateSituation(opponentCards);
        this.strategy = situation.strategy;

        if (!lastPlay || mustPlay) {
            // 主动出牌策略
            return this.decideFirstPlayAdvanced(finder, situation);
        }

        // 被动出牌策略
        const beatable = finder.findBeatable(lastPlay);
        
        if (!beatable) {
            return null; // 没有能打过的牌，不出
        }

        // 根据局势和风险偏好决定是否出牌
        if (situation.riskLevel === 'high' && this.strategy === 'aggressive') {
            // 高风险时更加积极
            return beatable;
        } else if (situation.riskLevel === 'low' && this.strategy === 'conservative') {
            // 低风险时更保守，保留大牌
            if (this.shouldHoldBigCardsAdvanced(beatable, lastPlay, situation)) {
                return null;
            }
        } else {
            // 中等风险用常规策略
            if (this.shouldHoldBigCards(beatable, lastPlay)) {
                return null;
            }
        }

        return beatable;
    }

    /**
     * 高级主动出牌策略
     */
    decideFirstPlayAdvanced(finder, situation) {
        const cards = this.hand.cards;
        const strength = this.evaluateHandStrength();
        
        // 如果快要获胜，优先出能获胜的牌
        if (cards.length <= 3) {
            // 可能的出牌方式
            if (cards.length === 1) return [cards[0]];
            if (cards.length === 2) {
                // 优先出单张，不行出对子，最后出王炸
                const pairs = finder.findPairs();
                const rocket = finder.findRocket();
                if (rocket.length > 0) return rocket[0];
                else if (pairs.length > 0) return pairs[pairs.length - 1];
                else return [cards[0]];
            }
            if (cards.length === 3) {
                // 尝试出三张或带牌
                const triples = finder.findTriples();
                if (triples.length > 0) return triples[triples.length - 1];
                else return [cards[0]]; // 单张
            }
        }

        // 根据手牌特点选择策略
        if (strength.connectedness > 0.4) {
            // 连续性强，优先出顺子
            const straights = finder.findStraights();
            if (straights.length > 0) {
                // 选择中等大小的顺子，不一定是最大的
                const sortedStraights = straights.sort((a, b) => {
                    const analysisA = RulesAnalyzer.analyze(a);
                    const analysisB = RulesAnalyzer.analyze(b);
                    return analysisA.mainWeight - analysisB.mainWeight;
                });
                return sortedStraights[Math.floor(sortedStraights.length / 2)];
            }
        }

        // 根据局势调整策略
        if (this.strategy === 'aggressive') {
            // 激进策略：出大牌
            const bombs = finder.findBombs();
            if (bombs.length > 0 && Math.random() < 0.3) {
                // 30%概率出炸弹压制对手
                return bombs[bombs.length - 1];
            }
        }

        // 默认策略：出非关键牌
        // 优先出不构成组合的牌
        const singles = finder.findSingles();
        const safeSingles = singles.filter(s => {
            const weight = s[0].weight;
            const weightCount = this.hand.cards.filter(c => c.weight === weight).length;
            // 避免出唯一的一张大牌
            return weight < 15 || weightCount > 1;
        });

        if (safeSingles.length > 0) {
            // 选择安全的最小单张
            return safeSingles[safeSingles.length - 1];
        }

        // 出对子
        const pairs = finder.findPairs().filter(p => p[0].weight < 15);
        if (pairs.length > 0) {
            return pairs[pairs.length - 1]; // 最小的对子
        }

        // 其他组合牌
        const tripleWithOne = finder.findTripleWithOne();
        if (tripleWithOne.length > 0) {
            return tripleWithOne[0];
        }

        return null;
    }

    /**
     * 更高级的保留大牌判断
     */
    shouldHoldBigCardsAdvanced(beatable, lastPlay, situation) {
        const analysis = RulesAnalyzer.analyze(beatable);
        
        // 如果是自己的优势牌型，可以适当保留
        if (analysis.type === 'bomb' || analysis.type === 'rocket') {
            if (this.cardCount > 5) {
                // 手牌较多时，如果局势不利，可保留大牌
                if (situation.riskLevel === 'high' && situation.strategy === 'aggressive') {
                    // 高风险激进策略，可能需要用炸弹突破
                    return Math.random() > 0.6;
                } else if (situation.riskLevel === 'low' && situation.strategy === 'conservative') {
                    // 低风险保守策略，尽量保留大牌确保胜利
                    return true;
                }
            }
            return this.cardCount > 3; // 手牌多时考虑保留
        }

        // 根据当前局势判断
        const myStrength = this.evaluateHandStrength();
        if (myStrength.totalCards <= 5 && myStrength.bombs > 0) {
            // 快赢了，且有炸弹，可以保留
            return true;
        }
        
        return false;
    }

    /**
     * 记忆对手出牌
     */
    rememberOpponentPlay(playerId, cards) {
        // 记录对手出牌，用于后续策略调整
        this.memory.push({
            playerId: playerId,
            cards: [...cards],
            timestamp: Date.now()
        });
        
        // 保持内存不超过一定数量
        if (this.memory.length > 20) {
            this.memory = this.memory.slice(-20);
        }
        
        // 基于记忆调整策略
        this.adaptStrategyBasedOnMemory();
    }

    /**
     * 基于记忆调整策略
     */
    adaptStrategyBasedOnMemory() {
        if (this.memory.length === 0) return;

        // 分析对手出牌模式
        const recentPlays = this.memory.slice(-10); // 分析最近10次出牌
        const totalCardsPlayed = recentPlays.reduce((sum, play) => sum + play.cards.length, 0);
        
        // 根据对手出牌频率调整风险偏好
        if (recentPlays.length > 0) {
            const avgTime = (Date.now() - recentPlays[0].timestamp) / recentPlays.length;
            if (avgTime < 3000) { // 对手出牌快，可能牌好
                this.aggressiveness = Math.min(1.0, this.aggressiveness + 0.1);
            } else { // 对手出牌慢，可能在思考
                this.aggressiveness = Math.max(0.1, this.aggressiveness - 0.05);
            }
        }
    }
}