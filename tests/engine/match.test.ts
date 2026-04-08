import { describe, it, expect } from "vitest";
import { canPlay, getPlayableCards } from "../../src/engine/match.js";
import type { Card } from "../../src/model/index.js";

describe("canPlay", () => {
  const redFive: Card = { kind: "number", color: "red", value: 5 };
  const blueFive: Card = { kind: "number", color: "blue", value: 5 };
  const redThree: Card = { kind: "number", color: "red", value: 3 };
  const blueSkip: Card = { kind: "action", color: "blue", action: "skip" };
  const redSkip: Card = { kind: "action", color: "red", action: "skip" };
  const wild: Card = { kind: "wild", wildType: "wild" };
  const wildFour: Card = { kind: "wild", wildType: "wild-draw-four" };

  it("matches same color number card", () => {
    expect(canPlay(redThree, redFive, "red")).toBe(true);
  });

  it("matches same number different color", () => {
    expect(canPlay(blueFive, redFive, "red")).toBe(true);
  });

  it("rejects different color different number", () => {
    expect(canPlay(blueSkip, redFive, "red")).toBe(false);
  });

  it("action card matches by color", () => {
    expect(canPlay(redSkip, blueFive, "red")).toBe(true);
  });

  it("action card matches by action type across colors", () => {
    expect(canPlay(redSkip, blueSkip, "blue")).toBe(true);
  });

  it("wild is always playable", () => {
    expect(canPlay(wild, redFive, "red")).toBe(true);
    expect(canPlay(wild, blueSkip, "blue")).toBe(true);
  });

  it("wild draw four is always playable", () => {
    expect(canPlay(wildFour, redFive, "red")).toBe(true);
  });
});

describe("getPlayableCards", () => {
  it("returns correct indices", () => {
    const hand: Card[] = [
      { kind: "number", color: "blue", value: 3 },
      { kind: "number", color: "red", value: 7 },
      { kind: "wild", wildType: "wild" },
    ];
    const top: Card = { kind: "number", color: "red", value: 5 };
    const indices = getPlayableCards(hand, top, "red");
    expect(indices).toContain(1); // red 7 matches by color
    expect(indices).toContain(2); // wild always playable
    expect(indices).not.toContain(0); // blue 3 doesn't match
  });

  it("returns empty array when no cards are playable", () => {
    const hand: Card[] = [
      { kind: "number", color: "blue", value: 3 },
      { kind: "number", color: "green", value: 2 },
    ];
    const top: Card = { kind: "number", color: "red", value: 5 };
    expect(getPlayableCards(hand, top, "red")).toEqual([]);
  });
});
