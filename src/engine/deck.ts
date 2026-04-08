import type { Card, Color, NumberValue, ActionType } from "../model/index.js";

const COLORS: Color[] = ["red", "yellow", "green", "blue"];
const ACTIONS: ActionType[] = ["skip", "reverse", "draw-two"];

export function createDeck(): Card[] {
  const cards: Card[] = [];

  for (const color of COLORS) {
    // One 0 per color
    cards.push({ kind: "number", color, value: 0 });

    // Two of each 1-9 per color
    for (let v = 1; v <= 9; v++) {
      cards.push({ kind: "number", color, value: v as NumberValue });
      cards.push({ kind: "number", color, value: v as NumberValue });
    }

    // Two of each action card per color
    for (const action of ACTIONS) {
      cards.push({ kind: "action", color, action });
      cards.push({ kind: "action", color, action });
    }
  }

  // Four wilds and four wild draw fours
  for (let i = 0; i < 4; i++) {
    cards.push({ kind: "wild", wildType: "wild" });
    cards.push({ kind: "wild", wildType: "wild-draw-four" });
  }

  return cards;
}

export function shuffle(cards: Card[], rng: () => number = Math.random): Card[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
