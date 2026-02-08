/**
 * 斗地主出牌规则模块
 * 实现所有牌型判断和比较逻辑
 */

import { sortCards, groupByWeight, countByWeight } from './card.js';

// 牌型枚举
export const CARD_TYPES = {
    INVALID: 'invalid',           // 无效牌型
    SINGLE: 'single',             // 单张
    PAIR: 'pair',                 // 对子
    TRIPLE: 'triple',             // 三张
    TRIPLE_ONE: 'triple_one',     // 三带一
    TRIPLE_PAIR: 'triple_pair',   // 三带一对
    STRAIGHT: 'straight',         // 顺子
    STRAIGHT_PAIR: 'straight_pair', // 连对
    PLANE: 'plane',               // 飞机不带
    PLANE_SINGLE: 'plane_single', // 飞机带单
    PLANE_PAIR: 'plane_pair',     // 飞机带对
    FOUR_TWO: 'four_two',         // 四带二
    FOUR_TWO_PAIR: 'four_two_pair', // 四带两对
    BOMB: 'bomb',                 // 炸弹
    ROCKET: 'rocket'              // 王炸
};

// 牌型名称（用于显示）
export const CARD_TYPE_NAMES = {
    [CARD_TYPES.INVALID]: '无效',
    [CARD_TYPES.SINGLE]: '单张',
    [CARD_TYPES.PAIR]: '对子',
    [CARD_TYPES.TRIPLE]: '三张',
    [CARD_TYPES.TRIPLE_ONE]: '三带一',
    [CARD_TYPES.TRIPLE_PAIR]: '三带二',
    [CARD_TYPES.STRAIGHT]: '顺子',
    [CARD_TYPES.STRAIGHT_PAIR]: '连对',
    [CARD_TYPES.PLANE]: '飞机',
    [CARD_TYPES.PLANE_SINGLE]: '飞机带单',
    [CARD_TYPES.PLANE_PAIR]: '飞机带对',
    [CARD_TYPES.FOUR_TWO]: '四带二',
    [CARD_TYPES.FOUR_TWO_PAIR]: '四带两对',
    [CARD_TYPES.BOMB]: '炸弹',
    [CARD_TYPES.ROCKET]: '王炸'
};

/**
 * 规则分析器类
 */
export class RulesAnalyzer {
    /**
     * 分析牌型
     * @param {Card[]} cards - 要分析的牌
     * @returns {Object} { type: 牌型, mainWeight: 主牌权重, cards: 排序后的牌 }
     */
    static analyze(cards) {
        if (!cards || cards.length === 0) {
            return { type: CARD_TYPES.INVALID, mainWeight: 0, cards: [] };
        }

        const sorted = sortCards(cards);
        const count = sorted.length;
        const groups = groupByWeight(sorted);
        const weights = Object.keys(groups).map(Number).sort((a, b) => b - a);

        // 王炸判断
        if (count === 2 && this.isRocket(sorted)) {
            return { type: CARD_TYPES.ROCKET, mainWeight: 17, cards: sorted };
        }

        // 炸弹判断
        if (count === 4 && this.isBomb(sorted)) {
            return { type: CARD_TYPES.BOMB, mainWeight: sorted[0].weight, cards: sorted };
        }

        // 单张
        if (count === 1) {
            return { type: CARD_TYPES.SINGLE, mainWeight: sorted[0].weight, cards: sorted };
        }

        // 对子
        if (count === 2 && this.isPair(sorted)) {
            return { type: CARD_TYPES.PAIR, mainWeight: sorted[0].weight, cards: sorted };
        }

        // 三张
        if (count === 3 && this.isTriple(sorted)) {
            return { type: CARD_TYPES.TRIPLE, mainWeight: sorted[0].weight, cards: sorted };
        }

        // 三带一
        if (count === 4) {
            const result = this.isTripleWithOne(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.TRIPLE_ONE, mainWeight: result.mainWeight, cards: sorted };
            }
        }

        // 三带一对
        if (count === 5) {
            const result = this.isTripleWithPair(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.TRIPLE_PAIR, mainWeight: result.mainWeight, cards: sorted };
            }
        }

        // 顺子 (5-12张)
        if (count >= 5 && count <= 12) {
            const result = this.isStraight(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.STRAIGHT, mainWeight: result.mainWeight, length: count, cards: sorted };
            }
        }

        // 连对 (6, 8, 10, 12... 张)
        if (count >= 6 && count % 2 === 0) {
            const result = this.isStraightPair(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.STRAIGHT_PAIR, mainWeight: result.mainWeight, length: count / 2, cards: sorted };
            }
        }

        // 飞机不带 (6, 9, 12... 张)
        if (count >= 6 && count % 3 === 0) {
            const result = this.isPlane(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.PLANE, mainWeight: result.mainWeight, length: count / 3, cards: sorted };
            }
        }

        // 飞机带单 (8, 12, 16... 张)
        if (count >= 8 && count % 4 === 0) {
            const result = this.isPlaneWithSingle(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.PLANE_SINGLE, mainWeight: result.mainWeight, length: count / 4, cards: sorted };
            }
        }

        // 飞机带对 (10, 15, 20 张)
        if (count >= 10 && count % 5 === 0) {
            const result = this.isPlaneWithPair(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.PLANE_PAIR, mainWeight: result.mainWeight, length: count / 5, cards: sorted };
            }
        }

        // 四带二
        if (count === 6) {
            const result = this.isFourWithTwo(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.FOUR_TWO, mainWeight: result.mainWeight, cards: sorted };
            }
        }

        // 四带两对
        if (count === 8) {
            const result = this.isFourWithTwoPair(sorted, groups);
            if (result.valid) {
                return { type: CARD_TYPES.FOUR_TWO_PAIR, mainWeight: result.mainWeight, cards: sorted };
            }
        }

        return { type: CARD_TYPES.INVALID, mainWeight: 0, cards: sorted };
    }

    /**
     * 判断是否王炸
     */
    static isRocket(cards) {
        return cards.length === 2 &&
            cards.some(c => c.value === 'JOKER_SMALL') &&
            cards.some(c => c.value === 'JOKER_BIG');
    }

    /**
     * 判断是否炸弹
     */
    static isBomb(cards) {
        if (cards.length !== 4) return false;
        return cards.every(c => c.weight === cards[0].weight);
    }

    /**
     * 判断是否对子
     */
    static isPair(cards) {
        if (cards.length !== 2) return false;
        return cards[0].weight === cards[1].weight && !cards[0].isJoker;
    }

    /**
     * 判断是否三张
     */
    static isTriple(cards) {
        if (cards.length !== 3) return false;
        return cards.every(c => c.weight === cards[0].weight);
    }

    /**
     * 判断是否三带一
     */
    static isTripleWithOne(cards, groups) {
        const counts = Object.values(groups).map(g => g.length);
        if (counts.includes(3) && counts.includes(1)) {
            const tripleWeight = Object.keys(groups).find(w => groups[w].length === 3);
            return { valid: true, mainWeight: Number(tripleWeight) };
        }
        return { valid: false };
    }

    /**
     * 判断是否三带一对
     */
    static isTripleWithPair(cards, groups) {
        const counts = Object.values(groups).map(g => g.length);
        if (counts.includes(3) && counts.includes(2)) {
            const tripleWeight = Object.keys(groups).find(w => groups[w].length === 3);
            // 带的牌不能是王
            const pairWeight = Object.keys(groups).find(w => groups[w].length === 2);
            if (Number(pairWeight) >= 16) return { valid: false }; // 王不能作为对子
            return { valid: true, mainWeight: Number(tripleWeight) };
        }
        return { valid: false };
    }

    /**
     * 判断是否顺子 (5-12张，不能包含2和王)
     */
    static isStraight(cards, groups) {
        const weights = Object.keys(groups).map(Number).sort((a, b) => a - b);
        
        // 检查每个权重只有一张牌
        if (!weights.every(w => groups[w].length === 1)) {
            return { valid: false };
        }
        
        // 不能包含2(15)和王(16,17)
        if (weights.some(w => w >= 15)) {
            return { valid: false };
        }
        
        // 检查是否连续
        for (let i = 1; i < weights.length; i++) {
            if (weights[i] - weights[i - 1] !== 1) {
                return { valid: false };
            }
        }
        
        // 至少5张
        if (weights.length < 5) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: weights[weights.length - 1] };
    }

    /**
     * 判断是否连对 (至少3连对)
     */
    static isStraightPair(cards, groups) {
        const weights = Object.keys(groups).map(Number).sort((a, b) => a - b);
        
        // 检查每个权重有两张牌
        if (!weights.every(w => groups[w].length === 2)) {
            return { valid: false };
        }
        
        // 不能包含2和王
        if (weights.some(w => w >= 15)) {
            return { valid: false };
        }
        
        // 检查是否连续
        for (let i = 1; i < weights.length; i++) {
            if (weights[i] - weights[i - 1] !== 1) {
                return { valid: false };
            }
        }
        
        // 至少3连对
        if (weights.length < 3) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: weights[weights.length - 1] };
    }

    /**
     * 判断是否飞机不带
     */
    static isPlane(cards, groups) {
        const weights = Object.keys(groups).map(Number).sort((a, b) => a - b);
        
        // 检查每个权重有三张牌
        if (!weights.every(w => groups[w].length === 3)) {
            return { valid: false };
        }
        
        // 不能包含2和王
        if (weights.some(w => w >= 15)) {
            return { valid: false };
        }
        
        // 检查是否连续
        for (let i = 1; i < weights.length; i++) {
            if (weights[i] - weights[i - 1] !== 1) {
                return { valid: false };
            }
        }
        
        // 至少2连三张
        if (weights.length < 2) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: weights[weights.length - 1] };
    }

    /**
     * 判断是否飞机带单
     */
    static isPlaneWithSingle(cards, groups) {
        const counts = Object.values(groups).map(g => g.length);
        const tripleCount = counts.filter(c => c >= 3).length;
        
        if (tripleCount < 2) {
            return { valid: false };
        }
        
        // 找出所有三张的权重
        const tripleWeights = [];
        for (const [weight, cardGroup] of Object.entries(groups)) {
            if (cardGroup.length >= 3) {
                tripleWeights.push(Number(weight));
            }
        }
        
        tripleWeights.sort((a, b) => a - b);
        
        // 找出最长的连续三张序列
        let maxSeq = this.findLongestConsecutive(tripleWeights);
        
        // 需要的单牌数量等于飞机数量
        const expectedPlaneCount = cards.length / 4;
        
        if (maxSeq.length !== expectedPlaneCount) {
            return { valid: false };
        }
        
        // 三张不能包含2
        if (maxSeq.some(w => w >= 15)) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: maxSeq[maxSeq.length - 1] };
    }

    /**
     * 判断是否飞机带对
     */
    static isPlaneWithPair(cards, groups) {
        const tripleWeights = [];
        const pairWeights = [];
        
        for (const [weight, cardGroup] of Object.entries(groups)) {
            if (cardGroup.length >= 3) {
                tripleWeights.push(Number(weight));
            }
            if (cardGroup.length === 2 || cardGroup.length === 4) {
                // 4张可以拆成2对
                const pairCount = Math.floor(cardGroup.length / 2);
                for (let i = 0; i < pairCount; i++) {
                    pairWeights.push(Number(weight));
                }
            }
        }
        
        tripleWeights.sort((a, b) => a - b);
        
        // 找出最长的连续三张序列
        let maxSeq = this.findLongestConsecutive(tripleWeights);
        
        // 需要的对子数量等于飞机数量
        const expectedPlaneCount = cards.length / 5;
        
        if (maxSeq.length !== expectedPlaneCount) {
            return { valid: false };
        }
        
        // 计算除了三张外还有多少对子
        const remainingPairs = pairWeights.filter(w => !maxSeq.includes(w) || groups[w].length > 3);
        
        // 这里逻辑复杂，简化处理
        // 三张不能包含2
        if (maxSeq.some(w => w >= 15)) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: maxSeq[maxSeq.length - 1] };
    }

    /**
     * 判断是否四带二
     */
    static isFourWithTwo(cards, groups) {
        const counts = Object.values(groups).map(g => g.length);
        
        if (!counts.includes(4)) {
            return { valid: false };
        }
        
        const fourWeight = Object.keys(groups).find(w => groups[w].length === 4);
        
        // 剩余牌必须是2张单牌
        const remaining = cards.length - 4;
        if (remaining !== 2) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: Number(fourWeight) };
    }

    /**
     * 判断是否四带两对
     */
    static isFourWithTwoPair(cards, groups) {
        const counts = Object.values(groups).map(g => g.length);
        
        if (!counts.includes(4)) {
            return { valid: false };
        }
        
        const fourWeight = Object.keys(groups).find(w => groups[w].length === 4);
        
        // 剩余的必须是两对
        const otherWeights = Object.keys(groups).filter(w => w !== fourWeight);
        
        // 检查其他牌是否都是对子
        for (const w of otherWeights) {
            if (groups[w].length !== 2) {
                return { valid: false };
            }
        }
        
        if (otherWeights.length !== 2) {
            return { valid: false };
        }
        
        return { valid: true, mainWeight: Number(fourWeight) };
    }

    /**
     * 找出数组中最长的连续序列
     */
    static findLongestConsecutive(arr) {
        if (arr.length === 0) return [];
        
        // 过滤掉2和王
        const filtered = arr.filter(w => w < 15);
        if (filtered.length === 0) return [];
        
        let maxSeq = [];
        let currentSeq = [filtered[0]];
        
        for (let i = 1; i < filtered.length; i++) {
            if (filtered[i] - filtered[i - 1] === 1) {
                currentSeq.push(filtered[i]);
            } else {
                if (currentSeq.length > maxSeq.length) {
                    maxSeq = currentSeq;
                }
                currentSeq = [filtered[i]];
            }
        }
        
        if (currentSeq.length > maxSeq.length) {
            maxSeq = currentSeq;
        }
        
        return maxSeq;
    }

    /**
     * 比较两组牌大小
     * @param {Object} play1 - 后出的牌的分析结果
     * @param {Object} play2 - 先出的牌的分析结果
     * @returns {boolean} play1是否能打过play2
     */
    static compare(play1, play2) {
        // 无效牌型不能出
        if (play1.type === CARD_TYPES.INVALID) {
            return false;
        }

        // 王炸最大
        if (play1.type === CARD_TYPES.ROCKET) {
            return true;
        }
        if (play2.type === CARD_TYPES.ROCKET) {
            return false;
        }

        // 炸弹比普通牌型大
        if (play1.type === CARD_TYPES.BOMB && play2.type !== CARD_TYPES.BOMB) {
            return true;
        }
        if (play2.type === CARD_TYPES.BOMB && play1.type !== CARD_TYPES.BOMB) {
            return false;
        }

        // 同类型比较
        if (play1.type !== play2.type) {
            return false;
        }

        // 顺子、连对、飞机需要长度相同
        if ([CARD_TYPES.STRAIGHT, CARD_TYPES.STRAIGHT_PAIR, CARD_TYPES.PLANE, 
             CARD_TYPES.PLANE_SINGLE, CARD_TYPES.PLANE_PAIR].includes(play1.type)) {
            if (play1.cards.length !== play2.cards.length) {
                return false;
            }
        }

        // 比较主牌权重
        return play1.mainWeight > play2.mainWeight;
    }

    /**
     * 检查出牌是否有效
     */
    static isValidPlay(cards, lastPlay = null) {
        const analysis = this.analyze(cards);
        
        if (analysis.type === CARD_TYPES.INVALID) {
            return { valid: false, reason: '无效的牌型' };
        }

        // 如果没有上家出牌，任意有效牌型都可以
        if (!lastPlay) {
            return { valid: true, analysis };
        }

        // 比较大小
        if (this.compare(analysis, lastPlay)) {
            return { valid: true, analysis };
        }

        return { valid: false, reason: '出的牌不够大' };
    }
}

/**
 * 牌型搜索器 - 从手牌中搜索特定牌型
 */
export class CardTypeFinder {
    constructor(cards) {
        this.cards = sortCards(cards);
        this.groups = groupByWeight(this.cards);
    }

    /**
     * 查找所有单张
     */
    findSingles() {
        return this.cards.map(c => [c]);
    }

    /**
     * 查找所有对子
     */
    findPairs() {
        const pairs = [];
        for (const [weight, cards] of Object.entries(this.groups)) {
            if (cards.length >= 2 && Number(weight) < 16) { // 王不能组对
                pairs.push(cards.slice(0, 2));
            }
        }
        return pairs;
    }

    /**
     * 查找所有三张
     */
    findTriples() {
        const triples = [];
        for (const [weight, cards] of Object.entries(this.groups)) {
            if (cards.length >= 3) {
                triples.push(cards.slice(0, 3));
            }
        }
        return triples;
    }

    /**
     * 查找所有炸弹
     */
    findBombs() {
        const bombs = [];
        for (const [weight, cards] of Object.entries(this.groups)) {
            if (cards.length === 4) {
                bombs.push(cards);
            }
        }
        return bombs;
    }

    /**
     * 查找王炸
     */
    findRocket() {
        const smallJoker = this.cards.find(c => c.value === 'JOKER_SMALL');
        const bigJoker = this.cards.find(c => c.value === 'JOKER_BIG');
        if (smallJoker && bigJoker) {
            return [[smallJoker, bigJoker]];
        }
        return [];
    }

    /**
     * 查找所有顺子
     */
    findStraights(minLength = 5) {
        const straights = [];
        const weights = Object.keys(this.groups)
            .map(Number)
            .filter(w => w < 15)
            .sort((a, b) => a - b);
        
        // 找出所有连续序列
        for (let start = 0; start < weights.length; start++) {
            for (let end = start + minLength - 1; end < weights.length; end++) {
                // 检查是否连续
                let isConsecutive = true;
                for (let i = start; i < end; i++) {
                    if (weights[i + 1] - weights[i] !== 1) {
                        isConsecutive = false;
                        break;
                    }
                }
                
                if (isConsecutive) {
                    const straight = [];
                    for (let i = start; i <= end; i++) {
                        straight.push(this.groups[weights[i]][0]);
                    }
                    straights.push(straight);
                }
            }
        }
        
        return straights;
    }

    /**
     * 查找所有连对
     */
    findStraightPairs(minPairs = 3) {
        const straightPairs = [];
        const weights = Object.keys(this.groups)
            .map(Number)
            .filter(w => w < 15 && this.groups[w].length >= 2)
            .sort((a, b) => a - b);
        
        for (let start = 0; start < weights.length; start++) {
            for (let end = start + minPairs - 1; end < weights.length; end++) {
                let isConsecutive = true;
                for (let i = start; i < end; i++) {
                    if (weights[i + 1] - weights[i] !== 1) {
                        isConsecutive = false;
                        break;
                    }
                }
                
                if (isConsecutive) {
                    const pairs = [];
                    for (let i = start; i <= end; i++) {
                        pairs.push(...this.groups[weights[i]].slice(0, 2));
                    }
                    straightPairs.push(pairs);
                }
            }
        }
        
        return straightPairs;
    }

    /**
     * 查找所有三带一组合
     */
    findTripleWithOne() {
        const results = [];
        const triples = this.findTriples();
        
        for (const triple of triples) {
            const tripleWeight = triple[0].weight;
            // 找单牌
            for (const card of this.cards) {
                if (card.weight !== tripleWeight) {
                    results.push([...triple, card]);
                }
            }
        }
        
        return results;
    }

    /**
     * 查找所有三带一对组合
     */
    findTripleWithPair() {
        const results = [];
        const triples = this.findTriples();
        const pairs = this.findPairs();
        
        for (const triple of triples) {
            const tripleWeight = triple[0].weight;
            for (const pair of pairs) {
                if (pair[0].weight !== tripleWeight) {
                    results.push([...triple, ...pair]);
                }
            }
        }
        
        return results;
    }

    /**
     * 查找能打过指定牌的最小牌组合
     */
    findBeatable(lastPlay) {
        if (!lastPlay) return null;

        const candidates = [];

        switch (lastPlay.type) {
            case CARD_TYPES.SINGLE:
                for (const card of this.cards) {
                    if (card.weight > lastPlay.mainWeight) {
                        candidates.push([card]);
                    }
                }
                break;

            case CARD_TYPES.PAIR:
                for (const pair of this.findPairs()) {
                    if (pair[0].weight > lastPlay.mainWeight) {
                        candidates.push(pair);
                    }
                }
                break;

            case CARD_TYPES.TRIPLE:
                for (const triple of this.findTriples()) {
                    if (triple[0].weight > lastPlay.mainWeight) {
                        candidates.push(triple);
                    }
                }
                break;

            case CARD_TYPES.TRIPLE_ONE:
                for (const combo of this.findTripleWithOne()) {
                    const analysis = RulesAnalyzer.analyze(combo);
                    if (analysis.mainWeight > lastPlay.mainWeight) {
                        candidates.push(combo);
                    }
                }
                break;

            case CARD_TYPES.TRIPLE_PAIR:
                for (const combo of this.findTripleWithPair()) {
                    const analysis = RulesAnalyzer.analyze(combo);
                    if (analysis.mainWeight > lastPlay.mainWeight) {
                        candidates.push(combo);
                    }
                }
                break;

            case CARD_TYPES.STRAIGHT:
                const length = lastPlay.cards.length;
                for (const straight of this.findStraights(length)) {
                    if (straight.length === length && straight[0].weight > lastPlay.mainWeight) {
                        candidates.push(straight);
                    }
                }
                break;

            case CARD_TYPES.STRAIGHT_PAIR:
                const pairLength = lastPlay.cards.length / 2;
                for (const sp of this.findStraightPairs(pairLength)) {
                    if (sp.length === lastPlay.cards.length) {
                        const analysis = RulesAnalyzer.analyze(sp);
                        if (analysis.mainWeight > lastPlay.mainWeight) {
                            candidates.push(sp);
                        }
                    }
                }
                break;

            case CARD_TYPES.BOMB:
                for (const bomb of this.findBombs()) {
                    if (bomb[0].weight > lastPlay.mainWeight) {
                        candidates.push(bomb);
                    }
                }
                break;
        }

        // 如果不是王炸，可以用炸弹/王炸压
        if (lastPlay.type !== CARD_TYPES.ROCKET) {
            if (lastPlay.type !== CARD_TYPES.BOMB) {
                candidates.push(...this.findBombs());
            }
            candidates.push(...this.findRocket());
        }

        // 返回最小的能打过的牌
        if (candidates.length > 0) {
            // 按权重排序，返回最小的
            candidates.sort((a, b) => {
                const analysisA = RulesAnalyzer.analyze(a);
                const analysisB = RulesAnalyzer.analyze(b);
                // 炸弹和王炸排最后（保留大牌）
                if (analysisA.type === CARD_TYPES.ROCKET) return 1;
                if (analysisB.type === CARD_TYPES.ROCKET) return -1;
                if (analysisA.type === CARD_TYPES.BOMB && analysisB.type !== CARD_TYPES.BOMB) return 1;
                if (analysisB.type === CARD_TYPES.BOMB && analysisA.type !== CARD_TYPES.BOMB) return -1;
                return analysisA.mainWeight - analysisB.mainWeight;
            });
            return candidates[0];
        }

        return null;
    }
}
