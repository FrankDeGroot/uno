import { describe, it, expect } from "vitest";
import { createDeck, shuffle } from "../../src/engine/deck.js";

describe("createDeck", () => {
  it("returns exactly 108 cards", () => {
    expect(createDeck()).toHaveLength(108);
  });

  it("has 19 number cards per color (one 0, two each of 1-9)", () => {
    const deck = createDeck();
    for (const color of ["red", "yellow", "green", "blue"] as const) {
      const colorCards = deck.filter(c => c.kind === "number" && c.color === color);
      expect(colorCards).toHaveLength(19);
      const zeros = colorCards.filter(c => c.kind === "number" && c.value === 0);
      expect(zeros).toHaveLength(1);
      for (let v = 1; v <= 9; v++) {
        const cards = colorCards.filter(c => c.kind === "number" && c.value === v);
        expect(cards).toHaveLength(2);
      }
    }
  });

  it("has 2 of each action type per color", () => {
    const deck = createDeck();
    for (const color of ["red", "yellow", "green", "blue"] as const) {
      for (const action of ["skip", "reverse", "draw-two"] as const) {
        const cards = deck.filter(c => c.kind === "action" && c.color === color && c.action === action);
        expect(cards).toHaveLength(2);
      }
    }
  });

  it("has 4 wilds and 4 wild draw fours", () => {
    const deck = createDeck();
    const wilds = deck.filter(c => c.kind === "wild" && c.wildType === "wild");
    const wildFours = deck.filter(c => c.kind === "wild" && c.wildType === "wild-draw-four");
    expect(wilds).toHaveLength(4);
    expect(wildFours).toHaveLength(4);
  });
});

describe("shuffle", () => {
  it("returns same number of cards", () => {
    const deck = createDeck();
    expect(shuffle(deck)).toHaveLength(deck.length);
  });

  it("does not mutate original array", () => {
    const deck = createDeck();
    const original = [...deck];
    shuffle(deck);
    expect(deck).toEqual(original);
  });

  it("produces deterministic output with seeded RNG", () => {
    let seed = 42;
    const seededRng = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    };
    const deck = createDeck();
    const result1 = shuffle(deck, seededRng);

    seed = 42;
    const result2 = shuffle(deck, seededRng);
    expect(result1).toEqual(result2);
  });
});
