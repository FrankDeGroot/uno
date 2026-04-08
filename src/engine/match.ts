import type { Card, Color } from "../model/index.js";

export function canPlay(card: Card, topCard: Card, currentColor: Color): boolean {
  if (card.kind === "wild") return true;

  if (card.kind === "number") {
    if (topCard.kind === "number") {
      return card.color === currentColor || card.value === topCard.value;
    }
    return card.color === currentColor;
  }

  // action card
  if (topCard.kind === "action") {
    return card.color === currentColor || card.action === topCard.action;
  }
  return card.color === currentColor;
}

export function getPlayableCards(hand: Card[], topCard: Card, currentColor: Color): number[] {
  return hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => canPlay(card, topCard, currentColor))
    .map(({ index }) => index);
}
