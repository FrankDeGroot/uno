import type { Card, Color } from "./card.js";

export interface Player {
  name: string;
  hand: Card[];
}

export interface GameState {
  drawPile: Card[];
  discardPile: Card[];
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  currentColor: Color;
  winner: number | null;
}
