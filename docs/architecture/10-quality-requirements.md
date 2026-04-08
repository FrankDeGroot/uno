# 10. Quality Requirements

## Quality Tree

```
Quality
├── Rules Correctness
│   ├── QS-01: Card matching rules are enforced correctly
│   ├── QS-02: Action card effects are applied correctly
│   ├── QS-03: Wild card color selection is applied correctly
│   └── QS-04: Win condition is detected when a hand empties
├── Testability
│   ├── QS-05: Engine functions can be called without I/O setup
│   └── QS-06: Shuffle and AI produce deterministic output with seeded RNG
├── Simplicity
│   ├── QS-07: No runtime dependencies
│   └── QS-08: Game runs with a single command after install
└── Playability
    ├── QS-09: A complete game can be played from start to finish
    └── QS-10: Invalid input does not crash the game
```

## Quality Scenarios

| ID | Quality Goal | Scenario | Expected Response | Priority |
| -- | ------------ | -------- | ----------------- | -------- |
| QS-01 | Rules correctness | A developer calls `canPlay()` with a card that matches the top discard only by color. | Returns `true`. The symmetric case (same number, different color) also returns `true`. A card matching neither returns `false`. | High |
| QS-02 | Rules correctness | `playCard()` is called with a Draw Two card as the current player. | The next player's hand grows by 2 cards, and `currentPlayerIndex` advances past the next player (turn skipped). | High |
| QS-03 | Rules correctness | `playCard()` is called with a Wild card and `chosenColor = "green"`. | `state.currentColor` is `"green"` and the Wild card on the discard pile has `chosenColor: "green"`. | High |
| QS-04 | Rules correctness | `playCard()` is called and the current player's hand becomes empty. | `state.winner` is set to the current player's index. The game loop terminates. | High |
| QS-05 | Testability | A test for `turn.ts` constructs a `GameState` directly and calls `playCard()`. | No I/O setup, no mocking required. The function returns a new state that can be asserted synchronously. | High |
| QS-06 | Testability | `shuffle()` is called with `rng = () => 0.5`. | The resulting order is identical across multiple calls with the same RNG. | Medium |
| QS-07 | Simplicity | `npm install` is run in the project directory. | Only `devDependencies` are installed (`typescript`, `tsx`, `vitest`, `@types/node`). The `dependencies` field is absent or empty. | Medium |
| QS-08 | Simplicity | A developer clones the repository and runs `npm install && npm start`. | The game launches without additional configuration, build steps, or environment variables. | Medium |
| QS-09 | Playability | A player starts a game and takes turns until either player empties their hand. | The game loop runs to completion and prints a game-over message. No runtime errors occur during normal play. | High |
| QS-10 | Playability | A player enters a non-numeric value or an out-of-range number at a card selection prompt. | The game re-prompts with an error message. State is unchanged. The game does not crash. | Medium |
