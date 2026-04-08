import { describe, it, expect } from "vitest";
import { chooseCard } from "../../src/ai/random-ai.js";
import type { Card } from "../../src/model/index.js";

const seededRng = (seed = 42) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

describe("chooseCard", () => {
  it("returns null when no cards are playable", () => {
    const hand: Card[] = [
      { kind: "number", color: "blue", value: 3 },
      { kind: "number", color: "green", value: 8 },
    ];
    const top: Card = { kind: "number", color: "red", value: 5 };
    expect(chooseCard(hand, top, "red")).toBeNull();
  });

  it("returns a valid playable card index", () => {
    const hand: Card[] = [
      { kind: "number", color: "blue", value: 3 },
      { kind: "number", color: "red", value: 7 },
    ];
    const top: Card = { kind: "number", color: "red", value: 5 };
    const result = chooseCard(hand, top, "red");
    expect(result).not.toBeNull();
    expect(result!.cardIndex).toBe(1);
  });

  it("returns a chosen color when playing a wild card", () => {
    const hand: Card[] = [{ kind: "wild", wildType: "wild" }];
    const top: Card = { kind: "number", color: "red", value: 5 };
    const result = chooseCard(hand, top, "red");
    expect(result).not.toBeNull();
    expect(result!.chosenColor).toBeDefined();
    expect(["red", "yellow", "green", "blue"]).toContain(result!.chosenColor);
  });

  it("produces deterministic output with seeded RNG", () => {
    const hand: Card[] = [
      { kind: "number", color: "red", value: 1 },
      { kind: "number", color: "red", value: 2 },
      { kind: "number", color: "red", value: 3 },
    ];
    const top: Card = { kind: "number", color: "red", value: 5 };
    const result1 = chooseCard(hand, top, "red", seededRng(42));
    const result2 = chooseCard(hand, top, "red", seededRng(42));
    expect(result1).toEqual(result2);
  });
});
