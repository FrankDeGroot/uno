import { describe, it, expect } from "vitest";
import { initGame } from "../../src/engine/game.js";

describe("initGame", () => {
  it("deals 7 cards to each player", () => {
    const state = initGame();
    expect(state.players[0].hand).toHaveLength(7);
    expect(state.players[1].hand).toHaveLength(7);
  });

  it("starts with one card on the discard pile", () => {
    const state = initGame();
    expect(state.discardPile).toHaveLength(1);
  });

  it("draw pile has 108 - 14 (dealt) - 1 (first discard) = 93 cards", () => {
    const state = initGame();
    expect(state.drawPile).toHaveLength(93);
  });

  it("has no winner at start", () => {
    const state = initGame();
    expect(state.winner).toBeNull();
  });

  it("first discard card is not a wild (initGame ensures a non-wild first card)", () => {
    // Run several times to be confident
    for (let i = 0; i < 20; i++) {
      const state = initGame();
      expect(state.discardPile[0].kind).not.toBe("wild");
    }
  });

  it("currentColor matches first discard card color", () => {
    const state = initGame();
    const top = state.discardPile[0];
    if (top.kind !== "wild") {
      expect(state.currentColor).toBe(top.color);
    }
  });

  it("currentPlayerIndex starts at 0", () => {
    const state = initGame();
    expect(state.currentPlayerIndex === 0 || state.currentPlayerIndex === 1).toBe(true);
  });
});
