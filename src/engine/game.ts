import type { GameState, Color } from "../model/index.js";
import { createDeck, shuffle } from "./deck.js";

const COLORS: Color[] = ["red", "yellow", "green", "blue"];

export function checkWinner(state: GameState): number | null {
  for (let i = 0; i < state.players.length; i++) {
    if (state.players[i].hand.length === 0) return i;
  }
  return null;
}

export function initGame(rng: () => number = Math.random): GameState {
  const deck = shuffle(createDeck(), rng);

  const hand0 = deck.splice(0, 7);
  const hand1 = deck.splice(0, 7);

  // Flip first non-wild card to start the discard pile
  let firstCardIndex = deck.findIndex(c => c.kind !== "wild");
  if (firstCardIndex === -1) firstCardIndex = 0;
  const [firstCard] = deck.splice(firstCardIndex, 1);

  let currentColor: Color;
  if (firstCard.kind === "wild") {
    currentColor = COLORS[Math.floor(rng() * 4)];
  } else {
    currentColor = firstCard.color;
  }

  let state: GameState = {
    drawPile: deck,
    discardPile: [firstCard],
    players: [
      { name: "You", hand: hand0 },
      { name: "Computer", hand: hand1 },
    ],
    currentPlayerIndex: 0,
    currentColor,
    winner: null,
  };

  // Apply action card effect if first card is an action card
  if (firstCard.kind === "action") {
    if (firstCard.action === "skip") {
      state = { ...state, currentPlayerIndex: 1 };
    } else if (firstCard.action === "draw-two") {
      const drawPile = [...state.drawPile];
      const hand = [...state.players[0].hand];
      for (let i = 0; i < 2; i++) {
        hand.push(drawPile.pop()!);
      }
      state = {
        ...state,
        drawPile,
        players: [{ ...state.players[0], hand }, state.players[1]],
        currentPlayerIndex: 1,
      };
    }
    // reverse: treated as normal, player 0 goes first
  }

  return state;
}
