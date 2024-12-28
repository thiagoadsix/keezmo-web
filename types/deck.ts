import { Card } from "./card";

export type Deck = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  /**
   * A deck is associated with cards.
   * @argument {number} totalCards - The total number of cards in the deck.
   */
  totalCards?: number;
  /**
   * A deck is associated with cards.
   * @argument {Card[]} cards - The cards in the deck.
   */
  cards?: Card[];
}
