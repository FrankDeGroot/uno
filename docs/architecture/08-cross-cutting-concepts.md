# 8. Cross-cutting Concepts

## Domain Model

The core domain entities are defined as TypeScript interfaces and discriminated unions in `src/model/`.

`Card` is a discriminated union on the `kind` field:

```typescript
type Card = NumberCard | ActionCard | WildCard;
```

- `NumberCard` — `kind: "number"`, a `Color`, and a `NumberValue` (0–9).
- `ActionCard` — `kind: "action"`, a `Color`, and an `ActionType` (`"skip" | "reverse" | "draw-two"`).
- `WildCard` — `kind: "wild"`, a `WildType` (`"wild" | "wild-draw-four"`), and an optional `chosenColor` set at play time.

`GameState` is a plain object holding all mutable game data: `drawPile`, `discardPile`, `players` (a two-element tuple), `currentPlayerIndex`, `currentColor`, and `winner`.

## State Management

Game state is a plain `GameState` object. Engine functions follow a functional-core pattern: they accept `GameState` and return a new (or mutated-and-returned) `GameState`. The UI layer holds the single current `state` reference and replaces it with the return value of each engine call. There is no observable/reactive state mechanism; the game loop is a simple `while` loop.

## Seeded Randomness

Functions that require randomness (`shuffle`, `chooseCard`, initial color selection for a first-discard Wild) accept an optional `rng?: () => number` parameter that defaults to `Math.random`. Tests pass a deterministic function (e.g., `() => 0.5` or a seeded linear congruential generator) to produce reproducible results without mocking the global `Math.random`.

## ANSI Color Rendering

`src/ui/renderer.ts` uses ANSI escape sequences to colorize card output in the terminal. Each UNO color maps to a terminal color:

| UNO Color | ANSI Code |
| --------- | --------- |
| Red | `\x1b[31m` |
| Yellow | `\x1b[33m` |
| Green | `\x1b[32m` |
| Blue | `\x1b[34m` |
| Reset | `\x1b[0m` |

No third-party color library is used. ANSI codes are inlined directly in the renderer.

## Error Handling

Engine functions assume valid input; they are called by `ui/game-loop.ts` with validated data. User input validation is performed by `ui/input.ts` before any engine call: `askChoice()` loops on re-prompts until a valid integer in the specified range is entered. Uncaught errors propagate to `main.ts`, which catches them, prints the error message, and exits with a non-zero status code.

## Security

Not applicable. The system has no network exposure, no authentication, no user data, and no persistent storage.

## Persistence

There is no persistence. Game state exists only in memory for the duration of a single process execution. No save/load functionality is implemented.

## Logging and Monitoring

There is no structured logging or monitoring. `console.log` is used exclusively for game output. Computer actions are narrated inline in the game loop output (e.g., "Computer played Blue 5", "Computer drew a card").

## Testing

The test strategy targets the pure functional core exclusively:

- `tests/engine/` covers `deck.ts`, `match.ts`, `turn.ts`, and `game.ts`.
- `tests/ai/` covers `random-ai.ts`.
- `src/ui/` is not automatically tested; it is verified through manual play.

Tests construct `GameState` objects directly rather than going through `initGame()`, giving each test precise control over the game state under test. The seeded RNG pattern (see above) allows deterministic testing of shuffle and AI behavior.

## Build and Deployment

`tsx` handles TypeScript execution at runtime; no compilation step is needed to run the game. `tsc --noEmit` is available for IDE-grade type checking. There is no CI pipeline.
