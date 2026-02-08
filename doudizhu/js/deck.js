/**
 * 牌组管理模块
 * 负责创建完整牌组、洗牌、发牌
 */

import { Card, SUITS, CARD_VALUES, sortCards } from './card.js';

/**
 * 牌组类 - 管理54张牌
 */
export class Deck {
    constructor() {
        this.cards = [];
        this.init();
    }

    /**
     * 初始化54张牌
     */
    init() {
        this.cards = [];
        
        // 添加52张普通牌
        const suits = [SUITS.SPADE, SUITS.HEART, SUITS.CLUB, SUITS.DIAMOND];
        const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        
        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(value, suit));
            }
        }
        
        // 添加大小王
        this.cards.push(new Card('JOKER_SMALL'));
        this.cards.push(new Card('JOKER_BIG'));
    }

    /**
     * Fisher-Yates 洗牌算法
     */
    shuffle() {
        const cards = this.cards;
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return this;
    }

    /**
     * 发牌 - 返回三份手牌和底牌
     * @returns {Object} { hands: [玩家1手牌, 玩家2手牌, 玩家3手牌], landlordCards: 底牌 }
     */
    deal() {
        this.shuffle();
        
        const hands = [[], [], []];
        
        // 每人发17张牌
        for (let i = 0; i < 51; i++) {
            hands[i % 3].push(this.cards[i]);
        }
        
        // 最后3张是底牌
        const landlordCards = this.cards.slice(51, 54);
        
        // 对手牌排序
        hands.forEach((hand, index) => {
            hands[index] = sortCards(hand);
        });
        
        return {
            hands: hands,
            landlordCards: sortCards(landlordCards)
        };
    }

    /**
     * 重置牌组
     */
    reset() {
        this.init();
        return this;
    }
}

/**
 * 手牌管理器 - 管理单个玩家的手牌
 */
export class HandManager {
    constructor(cards = []) {
        this.cards = cards;
    }

    /**
     * 添加牌
     */
    addCards(cards) {
        this.cards = sortCards([...this.cards, ...cards]);
        return this;
    }

    /**
     * 移除牌
     */
    removeCards(cardsToRemove) {
        const idsToRemove = new Set(cardsToRemove.map(c => c.id));
        this.cards = this.cards.filter(card => !idsToRemove.has(card.id));
        return this;
    }

    /**
     * 获取选中的牌
     */
    getSelectedCards() {
        return this.cards.filter(card => card.selected);
    }

    /**
     * 清除所有选中状态
     */
    clearSelection() {
        this.cards.forEach(card => card.selected = false);
        return this;
    }

    /**
     * 切换牌的选中状态
     */
    toggleCardSelection(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            card.selected = !card.selected;
        }
        return this;
    }

    /**
     * 获取手牌数量
     */
    get count() {
        return this.cards.length;
    }

    /**
     * 是否为空
     */
    get isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * 重新排序
     */
    sort() {
        this.cards = sortCards(this.cards);
        return this;
    }

    /**
     * 克隆
     */
    clone() {
        return new HandManager(this.cards.map(c => c.clone()));
    }
}
