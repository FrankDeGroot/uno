import { describe, it, expect } from "vitest";
import { playCard, drawCard, passTurn } from "../../src/engine/turn.js";
import type { GameState, Card } from "../../src/model/index.js";

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    drawPile: [
      { kind: "number", color: "green", value: 1 },
      { kind: "number", color: "green", value: 2 },
      { kind: "number", color: "green", value: 3 },
      { kind: "number", color: "green", value: 4 },
      { kind: "number", color: "green", value: 5 },
    ],
    discardPile: [{ kind: "number", color: "red", value: 5 }],
    players: [
      {
        name: "You",
        hand: [
          { kind: "number", color: "red", value: 3 },
          { kind: "number", color: "blue", value: 2 },
        ],
      },
      { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
    ],
    currentPlayerIndex: 0,
    currentColor: "red",
    winner: null,
  };
  return { ...base, ...overrides };
}

describe("playCard", () => {
  it("moves card from hand to discard pile and advances turn", () => {
    const state = makeState();
    const next = playCard(state, 0);
    expect(next.players[0].hand).toHaveLength(1);
    expect(next.discardPile).toHaveLength(2);
    expect(next.currentPlayerIndex).toBe(1);
  });

  it("detects win when hand becomes empty", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "number", color: "red", value: 3 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0);
    expect(next.winner).toBe(0);
  });

  it("Skip advances turn past next player (back to current)", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "action", color: "red", action: "skip" }, { kind: "number", color: "red", value: 1 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0);
    expect(next.currentPlayerIndex).toBe(0);
  });

  it("Draw Two forces next player to draw 2 and skip their turn", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "action", color: "red", action: "draw-two" }, { kind: "number", color: "red", value: 1 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0);
    expect(next.players[1].hand).toHaveLength(3); // 1 original + 2 drawn
    expect(next.currentPlayerIndex).toBe(0); // skipped back to human
  });

  it("Wild sets chosen color", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "wild", wildType: "wild" }, { kind: "number", color: "red", value: 1 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0, "blue");
    expect(next.currentColor).toBe("blue");
  });

  it("Wild Draw Four sets color and forces draw 4 and skip", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "wild", wildType: "wild-draw-four" }, { kind: "number", color: "red", value: 1 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0, "green");
    expect(next.currentColor).toBe("green");
    expect(next.players[1].hand).toHaveLength(5); // 1 original + 4 drawn
    expect(next.currentPlayerIndex).toBe(0); // skipped
  });

  it("Reverse in 2-player does NOT act as Skip — turn advances normally", () => {
    const state = makeState({
      players: [
        { name: "You", hand: [{ kind: "action", color: "red", action: "reverse" }, { kind: "number", color: "red", value: 1 }] },
        { name: "Computer", hand: [{ kind: "number", color: "blue", value: 7 }] },
      ],
    });
    const next = playCard(state, 0);
    expect(next.currentPlayerIndex).toBe(1); // normal advance, not skipped
  });
});

describe("drawCard", () => {
  it("adds a card to current player's hand", () => {
    const state = makeState();
    const handSizeBefore = state.players[0].hand.length;
    const { state: next, drawnCard } = drawCard(state);
    expect(next.players[0].hand).toHaveLength(handSizeBefore + 1);
    expect(drawnCard).toBeDefined();
  });

  it("reshuffles discard pile when draw pile is empty", () => {
    const topCard: Card = { kind: "number", color: "red", value: 5 };
    const state = makeState({
      drawPile: [],
      discardPile: [
        { kind: "number", color: "blue", value: 1 },
        { kind: "number", color: "blue", value: 2 },
        { kind: "number", color: "blue", value: 3 },
        topCard,
      ],
    });
    const handSizeBefore = state.players[0].hand.length;
    const { state: next } = drawCard(state);
    expect(next.players[0].hand).toHaveLength(handSizeBefore + 1);
    // Top of discard pile preserved
    expect(next.discardPile[next.discardPile.length - 1]).toEqual(topCard);
  });
});

describe("passTurn", () => {
  it("advances to next player", () => {
    const state = makeState();
    expect(passTurn(state).currentPlayerIndex).toBe(1);
    expect(passTurn({ ...state, currentPlayerIndex: 1 }).currentPlayerIndex).toBe(0);
  });
});
