import type { Card, Color } from "../model/index.js";
import { getPlayableCards } from "../engine/index.js";

const COLORS: Color[] = ["red", "yellow", "green", "blue"];

export function chooseCard(
  hand: Card[],
  topCard: Card,
  currentColor: Color,
  rng: () => number = Math.random
): { cardIndex: number; chosenColor?: Color } | null {
  const playable = getPlayableCards(hand, topCard, currentColor);
  if (playable.length === 0) return null;

  const cardIndex = playable[Math.floor(rng() * playable.length)];
  const card = hand[cardIndex];

  if (card.kind === "wild") {
    const chosenColor = COLORS[Math.floor(rng() * COLORS.length)];
    return { cardIndex, chosenColor };
  }

  return { cardIndex };
}
