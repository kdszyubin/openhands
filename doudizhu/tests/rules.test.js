/**
 * @jest-environment jsdom
 */

import { RulesAnalyzer, CARD_TYPES } from '../js/rules.js';
import { Card } from '../js/card.js';

describe('RulesAnalyzer', () => {
    
    // Helper to create card arrays quickly
    const createCards = (cardStrings) => {
        return cardStrings.map(str => {
            if (str === 'JOKER_SMALL' || str === 'JOKER_BIG') {
                return new Card(str);
            }
            // Format: ValueSuit e.g. "3♠"
            const value = str.slice(0, str.length - 1);
            // Default suit for testing if not specified or just mapping simple symbols
            // But Card constructor expects actual suit object or just value/suit
            // Let's reuse Deck's initialization logic or just mock suit object
            const suitChar = str.slice(-1);
            const suitMap = {
                '♠': { name: '♠', color: 'black', order: 4 },
                '♥': { name: '♥', color: 'red', order: 3 },
                '♣': { name: '♣', color: 'black', order: 2 },
                '♦': { name: '♦', color: 'red', order: 1 }
            };
            return new Card(value, suitMap[suitChar]);
        });
    };

    test('should identify single card', () => {
        const cards = createCards(['3♠']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.SINGLE);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify pair', () => {
        const cards = createCards(['3♠', '3♥']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.PAIR);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify triple', () => {
        const cards = createCards(['3♠', '3♥', '3♣']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.TRIPLE);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify triple with one', () => {
        const cards = createCards(['3♠', '3♥', '3♣', '4♦']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.TRIPLE_ONE);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify triple with pair', () => {
        const cards = createCards(['3♠', '3♥', '3♣', '4♦', '4♣']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.TRIPLE_PAIR);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify bomb', () => {
        const cards = createCards(['3♠', '3♥', '3♣', '3♦']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.BOMB);
        expect(result.mainWeight).toBe(3);
    });

    test('should identify rocket', () => {
        const cards = createCards(['JOKER_SMALL', 'JOKER_BIG']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.ROCKET);
        expect(result.mainWeight).toBe(17);
    });

    test('should identify straight', () => {
        const cards = createCards(['3♠', '4♠', '5♠', '6♠', '7♠']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.STRAIGHT);
        expect(result.mainWeight).toBe(7); // Main weight is usually the highest card for straight
    });

    test('should reject invalid straight', () => {
        // Not consecutive
        let cards = createCards(['3♠', '4♠', '5♠', '7♠', '8♠']);
        let result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.INVALID);

        // Contains 2
        cards = createCards(['J♠', 'Q♠', 'K♠', 'A♠', '2♠']);
        result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.INVALID);
    });

    // Test for four with two
    test('should identify four with two', () => {
        const cards = createCards(['3♠', '3♥', '3♣', '3♦', '4♠', '5♥']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.FOUR_TWO);
        expect(result.mainWeight).toBe(3);
    });

    // Test for four with two pairs
    test('should identify four with two pairs', () => {
        const cards = createCards(['3♠', '3♥', '3♣', '3♦', '4♠', '4♥', '5♠', '5♥']);
        const result = RulesAnalyzer.analyze(cards);
        expect(result.type).toBe(CARD_TYPES.FOUR_TWO_PAIR);
        expect(result.mainWeight).toBe(3);
    });
});
