/**
 * 扑克牌模块
 * 定义单张扑克牌的数据结构和显示逻辑
 */

// 花色定义
export const SUITS = {
    SPADE: { name: '♠', color: 'black', order: 4 },
    HEART: { name: '♥', color: 'red', order: 3 },
    CLUB: { name: '♣', color: 'black', order: 2 },
    DIAMOND: { name: '♦', color: 'red', order: 1 }
};

// 牌面值定义 (斗地主中的大小顺序)
export const CARD_VALUES = {
    '3': { display: '3', weight: 3 },
    '4': { display: '4', weight: 4 },
    '5': { display: '5', weight: 5 },
    '6': { display: '6', weight: 6 },
    '7': { display: '7', weight: 7 },
    '8': { display: '8', weight: 8 },
    '9': { display: '9', weight: 9 },
    '10': { display: '10', weight: 10 },
    'J': { display: 'J', weight: 11 },
    'Q': { display: 'Q', weight: 12 },
    'K': { display: 'K', weight: 13 },
    'A': { display: 'A', weight: 14 },
    '2': { display: '2', weight: 15 },
    'JOKER_SMALL': { display: '小王', weight: 16 },
    'JOKER_BIG': { display: '大王', weight: 17 }
};

/**
 * 扑克牌类
 */
export class Card {
    constructor(value, suit = null) {
        this.value = value;
        this.suit = suit;
        this.selected = false;
        this.id = this.generateId();
    }

    generateId() {
        const suitName = this.suit ? this.suit.name : 'joker';
        return `${suitName}-${this.value}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 获取牌的权重（用于比较大小）
    get weight() {
        return CARD_VALUES[this.value]?.weight || 0;
    }

    // 获取显示文本
    get displayValue() {
        return CARD_VALUES[this.value]?.display || this.value;
    }

    // 获取花色符号
    get suitSymbol() {
        return this.suit?.name || '';
    }

    // 获取颜色
    get color() {
        if (this.value === 'JOKER_SMALL') return 'black';
        if (this.value === 'JOKER_BIG') return 'red';
        return this.suit?.color || 'black';
    }

    // 是否是王牌
    get isJoker() {
        return this.value === 'JOKER_SMALL' || this.value === 'JOKER_BIG';
    }

    // 创建DOM元素
    createElement(faceUp = true) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${this.color} ${this.selected ? 'selected' : ''}`;
        cardEl.dataset.cardId = this.id;
        
        if (!faceUp) {
            cardEl.classList.add('face-down');
            cardEl.innerHTML = '<div class="card-back-pattern"></div>';
            return cardEl;
        }

        if (this.isJoker) {
            cardEl.classList.add('joker');
            cardEl.classList.add(this.value === 'JOKER_BIG' ? 'big-joker' : 'small-joker');
            cardEl.innerHTML = `
                <div class="card-corner top-left">
                    <span class="card-value">${this.value === 'JOKER_BIG' ? '大' : '小'}</span>
                    <span class="card-suit">王</span>
                </div>
                <div class="card-center joker-center">
                    <span class="joker-icon">${this.value === 'JOKER_BIG' ? '👑' : '🃏'}</span>
                </div>
                <div class="card-corner bottom-right">
                    <span class="card-value">${this.value === 'JOKER_BIG' ? '大' : '小'}</span>
                    <span class="card-suit">王</span>
                </div>
            `;
        } else {
            cardEl.innerHTML = `
                <div class="card-corner top-left">
                    <span class="card-value">${this.displayValue}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
                <div class="card-center">
                    <span class="card-suit-large">${this.suitSymbol}</span>
                </div>
                <div class="card-corner bottom-right">
                    <span class="card-value">${this.displayValue}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
            `;
        }

        return cardEl;
    }

    // 比较两张牌
    compare(other) {
        return this.weight - other.weight;
    }

    // 转换为字符串（用于调试）
    toString() {
        if (this.isJoker) {
            return this.displayValue;
        }
        return `${this.suitSymbol}${this.displayValue}`;
    }

    // 克隆牌
    clone() {
        const cloned = new Card(this.value, this.suit);
        cloned.selected = this.selected;
        return cloned;
    }
}

/**
 * 根据权重值获取牌面值
 */
export function getValueByWeight(weight) {
    for (const [value, info] of Object.entries(CARD_VALUES)) {
        if (info.weight === weight) {
            return value;
        }
    }
    return null;
}

/**
 * 排序牌组（从大到小）
 */
export function sortCards(cards) {
    return [...cards].sort((a, b) => {
        if (b.weight !== a.weight) {
            return b.weight - a.weight;
        }
        // 权重相同时按花色排序
        const suitOrderA = a.suit?.order || 0;
        const suitOrderB = b.suit?.order || 0;
        return suitOrderB - suitOrderA;
    });
}

/**
 * 获取牌组中指定权重的牌数量
 */
export function countByWeight(cards, weight) {
    return cards.filter(card => card.weight === weight).length;
}

/**
 * 按权重分组
 */
export function groupByWeight(cards) {
    const groups = {};
    cards.forEach(card => {
        const w = card.weight;
        if (!groups[w]) {
            groups[w] = [];
        }
        groups[w].push(card);
    });
    return groups;
}
