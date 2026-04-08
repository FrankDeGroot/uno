import type { GameState, Card, Color } from "../model/index.js";
import { checkWinner } from "./game.js";

function nextPlayerIndex(current: 0 | 1): 0 | 1 {
  return current === 0 ? 1 : 0;
}

function drawFromPile(state: GameState): { state: GameState; drawnCard: Card } {
  const s = { ...state, drawPile: [...state.drawPile], discardPile: [...state.discardPile] };

  if (s.drawPile.length === 0) {
    // Reshuffle discard pile (keep top card)
    const topCard = s.discardPile[s.discardPile.length - 1];
    const toReshuffle = s.discardPile.slice(0, s.discardPile.length - 1);
    // Fisher-Yates in place
    for (let i = toReshuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toReshuffle[i], toReshuffle[j]] = [toReshuffle[j], toReshuffle[i]];
    }
    s.drawPile = toReshuffle;
    s.discardPile = [topCard];
  }

  const drawnCard = s.drawPile[s.drawPile.length - 1];
  s.drawPile = s.drawPile.slice(0, s.drawPile.length - 1);
  return { state: s, drawnCard };
}

function giveCards(state: GameState, playerIndex: 0 | 1, count: number): GameState {
  let s = state;
  const hand = [...s.players[playerIndex].hand];
  for (let i = 0; i < count; i++) {
    const result = drawFromPile(s);
    s = result.state;
    hand.push(result.drawnCard);
  }
  const players: [typeof s.players[0], typeof s.players[1]] = [
    { ...s.players[0] },
    { ...s.players[1] },
  ];
  players[playerIndex] = { ...players[playerIndex], hand };
  return { ...s, players };
}

export function playCard(state: GameState, cardIndex: number, chosenColor?: Color): GameState {
  const current = state.currentPlayerIndex;
  const hand = [...state.players[current].hand];
  const card = hand[cardIndex];
  hand.splice(cardIndex, 1);

  const players: [typeof state.players[0], typeof state.players[1]] = [
    { ...state.players[0] },
    { ...state.players[1] },
  ];
  players[current] = { ...players[current], hand };

  // Place card on discard pile (with chosen color if wild)
  const playedCard: Card = card.kind === "wild" && chosenColor
    ? { ...card, chosenColor }
    : card;

  const discardPile = [...state.discardPile, playedCard];

  let currentColor: Color = state.currentColor;
  if (card.kind === "wild" && chosenColor) {
    currentColor = chosenColor;
  } else if (card.kind !== "wild") {
    currentColor = card.color;
  }

  let s: GameState = { ...state, players, discardPile, currentColor };

  // Check for win before applying action effects
  const winner = checkWinner(s);
  if (winner !== null) {
    return { ...s, winner };
  }

  const next = nextPlayerIndex(current);

  if (card.kind === "action") {
    if (card.action === "skip") {
      // Skip next player — advance twice
      s = { ...s, currentPlayerIndex: nextPlayerIndex(next) };
      return s;
    } else if (card.action === "reverse") {
      // In 2-player, reverse acts as a normal turn advance (not special-cased as skip)
      s = { ...s, currentPlayerIndex: next };
      return s;
    } else if (card.action === "draw-two") {
      s = giveCards(s, next, 2);
      s = { ...s, currentPlayerIndex: nextPlayerIndex(next) };
      return s;
    }
  } else if (card.kind === "wild" && card.wildType === "wild-draw-four") {
    s = giveCards(s, next, 4);
    s = { ...s, currentPlayerIndex: nextPlayerIndex(next) };
    return s;
  }

  return { ...s, currentPlayerIndex: next };
}

export function drawCard(state: GameState): { state: GameState; drawnCard: Card } {
  const current = state.currentPlayerIndex;
  const { state: s, drawnCard } = drawFromPile(state);
  const hand = [...s.players[current].hand, drawnCard];
  const players: [typeof s.players[0], typeof s.players[1]] = [
    { ...s.players[0] },
    { ...s.players[1] },
  ];
  players[current] = { ...players[current], hand };
  return { state: { ...s, players }, drawnCard };
}

export function passTurn(state: GameState): GameState {
  const next = nextPlayerIndex(state.currentPlayerIndex);
  return { ...state, currentPlayerIndex: next };
}
