/**
 * @jest-environment jsdom
 */

import { Deck, HandManager } from '../js/deck.js';
import { Card } from '../js/card.js';

describe('Deck', () => {
    let deck;

    beforeEach(() => {
        deck = new Deck();
    });

    test('should initialize with 54 cards', () => {
        expect(deck.cards.length).toBe(54);
    });

    test('should contain all suits and ranks', () => {
        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        
        // Check standard cards
        suits.forEach(suit => {
            values.forEach(value => {
                const card = deck.cards.find(c => c.suitSymbol === suit && c.displayValue === value);
                expect(card).toBeDefined();
            });
        });

        // Check jokers
        const smallJoker = deck.cards.find(c => c.value === 'JOKER_SMALL');
        const bigJoker = deck.cards.find(c => c.value === 'JOKER_BIG');
        expect(smallJoker).toBeDefined();
        expect(bigJoker).toBeDefined();
    });

    test('should shuffle cards', () => {
        const originalOrder = [...deck.cards];
        deck.shuffle();
        // It is statistically highly improbable that the shuffled deck matches the original order exactly
        let different = false;
        for(let i=0; i<deck.cards.length; i++) {
            if (deck.cards[i] !== originalOrder[i]) {
                different = true;
                break;
            }
        }
        expect(different).toBe(true);
        expect(deck.cards.length).toBe(54);
    });

    test('should deal cards correctly', () => {
        const { hands, landlordCards } = deck.deal();
        
        expect(hands.length).toBe(3);
        expect(hands[0].length).toBe(17);
        expect(hands[1].length).toBe(17);
        expect(hands[2].length).toBe(17);
        expect(landlordCards.length).toBe(3);
        
        // Total cards should be 54
        const total = hands[0].length + hands[1].length + hands[2].length + landlordCards.length;
        expect(total).toBe(54);
    });

    test('should reset deck', () => {
        deck.shuffle();
        deck.reset();
        expect(deck.cards.length).toBe(54);
        // The first card in a fresh deck is 3 of Spades based on the loops in Deck.init
        expect(deck.cards[0].value).toBe('3');
        expect(deck.cards[0].suit.name).toBe('♠');
    });
});

describe('HandManager', () => {
    let handManager;
    let cards;

    beforeEach(() => {
        cards = [
            new Card('3', { name: '♠', color: 'black', order: 4 }),
            new Card('4', { name: '♥', color: 'red', order: 3 }),
            new Card('5', { name: '♣', color: 'black', order: 2 })
        ];
        handManager = new HandManager(cards);
    });

    test('should initialize with cards', () => {
        expect(handManager.count).toBe(3);
    });

    test('should add cards and sort them', () => {
        const newCard = new Card('6', { name: '♦', color: 'red', order: 1 });
        handManager.addCards([newCard]);
        expect(handManager.count).toBe(4);
        // Check sorting: 6 > 5 > 4 > 3
        expect(handManager.cards[0].value).toBe('6');
    });

    test('should remove cards', () => {
        const cardToRemove = cards[0]; // 3 of Spades
        handManager.removeCards([cardToRemove]);
        expect(handManager.count).toBe(2);
        expect(handManager.cards.find(c => c.id === cardToRemove.id)).toBeUndefined();
    });

    test('should handle card selection', () => {
        const card = handManager.cards[0];
        handManager.toggleCardSelection(card.id);
        expect(card.selected).toBe(true);
        
        const selected = handManager.getSelectedCards();
        expect(selected.length).toBe(1);
        expect(selected[0].id).toBe(card.id);

        handManager.clearSelection();
        expect(card.selected).toBe(false);
        expect(handManager.getSelectedCards().length).toBe(0);
    });
});
