# Implementation Plan: UNO Console Game (WoMiWo)

**Spec:** `docs/product/impact-map.md`
**Created:** 2026-04-08
**Status:** Draft

## Summary

Build a complete console-based UNO card game in TypeScript where a single player plays against a random-AI computer opponent. The game uses a standard 108-card UNO deck, supports all action and wild cards, and runs entirely in the terminal via stdin/stdout. The architecture separates pure game logic (fully testable without I/O) from a thin console UI layer.

## Key Design Decisions

1. **Vitest as the test framework.** It is the modern standard for TypeScript projects, has zero-config ESM support, fast execution, and native TypeScript understanding. No Babel or ts-jest configuration needed.

2. **No CLI input library -- use Node.js `readline` directly.** The interaction model is simple numbered menus. A library like `inquirer` or `prompts` would add a dependency for no real benefit. A thin wrapper around `readline` keeps the project dependency-free beyond dev tooling.

3. **Three-layer architecture: Model, Engine, UI.** `model/` contains pure data types and card definitions. `engine/` contains all game logic (deck building, shuffling, matching rules, turn resolution, win detection). `ui/` contains the console renderer and input handler. Engine has zero I/O dependencies so all rule logic is unit-testable with plain function calls.

4. **Functional-core, imperative-shell pattern.** Game state is a plain object (`GameState`). Engine functions take state in and return new state out (or mutate-and-return for simplicity in a single-player game). The UI loop is the only imperative code. This makes tests trivial: construct a state, call a function, assert the result.

5. **`tsx` as the runner.** Use `tsx` (esbuild-backed TypeScript executor) to run the game directly without a separate compile step. This avoids a `tsc` build pipeline for what is a dev/learning project. The `tsconfig.json` still exists for editor support and type checking.

6. **Single `src/` directory with flat module folders.** No monorepo, no deep nesting. The project is small enough that `src/model/`, `src/engine/`, `src/ui/`, and `src/ai/` at one level of depth is sufficient.

7. **AI as a pluggable strategy function.** The AI is a single function `chooseCard(hand, topCard, currentColor): number | null` that returns the index of the card to play or null to draw. This makes it trivial to swap in a smarter AI later without touching any other code.

8. **Seeded random for testability.** The shuffle function accepts an optional random-number generator so tests can use a deterministic seed. Production code uses `Math.random`.

## Implementation Steps

### Phase 1: Project Scaffolding

**Step 1.1 -- Initialize the Node.js project**
- Create `package.json` with `"type": "module"`, name `womiwo`, version `0.1.0`.
- Scripts: `"start": "tsx src/main.ts"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.

**Step 1.2 -- Install dev dependencies**
- `typescript`, `tsx`, `vitest`, `@types/node`.
- No runtime dependencies.

**Step 1.3 -- Create `tsconfig.json`**
- Target: `ES2022`. Module: `Node16`. ModuleResolution: `Node16`.
- Strict mode enabled. `outDir: "dist"`, `rootDir: "src"`.
- Include `src/**/*.ts`.

**Step 1.4 -- Create directory structure**
```
src/
  model/
  engine/
  ai/
  ui/
  main.ts
tests/
  engine/
  ai/
```

### Phase 2: Model Layer (Pure Data Types)

**Step 2.1 -- `src/model/card.ts`**
Define the core types:
```typescript
type Color = "red" | "yellow" | "green" | "blue";
type NumberValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ActionType = "skip" | "reverse" | "draw-two";
type WildType = "wild" | "wild-draw-four";

// Discriminated union for cards:
interface NumberCard { kind: "number"; color: Color; value: NumberValue }
interface ActionCard { kind: "action"; color: Color; action: ActionType }
interface WildCard  { kind: "wild"; wildType: WildType; chosenColor?: Color }

type Card = NumberCard | ActionCard | WildCard;
```
Export all types and a `cardDisplayName(card): string` utility for rendering.

**Step 2.2 -- `src/model/game-state.ts`**
Define the game state:
```typescript
interface Player {
  name: string;
  hand: Card[];
}

interface GameState {
  drawPile: Card[];
  discardPile: Card[];
  players: [Player, Player];       // index 0 = human, index 1 = computer
  currentPlayerIndex: 0 | 1;
  currentColor: Color;             // tracks chosen color for wilds
  winner: number | null;
}
```

### Phase 3: Engine Layer (Game Logic)

**Step 3.1 -- `src/engine/deck.ts`**
- `createDeck(): Card[]` -- builds the standard 108-card UNO deck:
  - Per color: one 0, two each of 1-9, two each of Skip/Reverse/Draw Two (76 colored cards).
  - Four Wilds, four Wild Draw Fours (8 wild cards).
- `shuffle(cards: Card[], rng?: () => number): Card[]` -- Fisher-Yates shuffle. Defaults to `Math.random`. Accepts optional RNG for deterministic tests.

**Step 3.2 -- `src/engine/match.ts`**
- `canPlay(card: Card, topCard: Card, currentColor: Color): boolean`
  - Number/action cards: match if same color as `currentColor`, or same value/action as `topCard`.
  - Wild cards: always playable.
  - Wild Draw Four: always playable (no "challenge" rule in this version).
- `getPlayableCards(hand: Card[], topCard: Card, currentColor: Color): number[]` -- returns indices of playable cards.

**Step 3.3 -- `src/engine/turn.ts`**
- `playCard(state: GameState, cardIndex: number, chosenColor?: Color): GameState`
  - Removes card from current player's hand, places on discard pile.
  - If wild, sets `chosenColor` on the card and updates `state.currentColor`.
  - Applies action effects:
    - **Skip**: next player loses their turn (advance `currentPlayerIndex` twice).
    - **Reverse**: in 2-player, acts the same as normal turn progression (as specified -- not special-cased as Skip).
    - **Draw Two**: next player draws 2 cards, loses their turn.
    - **Wild Draw Four**: next player draws 4 cards, loses their turn; color is set.
  - Checks win condition.
  - Advances to next player.

- `drawCard(state: GameState): { state: GameState; drawnCard: Card }`
  - Draws top card from draw pile.
  - If draw pile is empty, reshuffles discard pile (except top card) into draw pile.
  - Adds drawn card to current player's hand.

- `passTurn(state: GameState): GameState`
  - Called when player draws and chooses not to play the drawn card. Advances turn.

**Step 3.4 -- `src/engine/game.ts`**
- `initGame(rng?: () => number): GameState`
  - Creates deck, shuffles, deals 7 cards to each player.
  - Flips first card to discard pile. If the first card is a Wild, set a random color. If it is an action card, apply its effect to the first player's turn.
  - Sets `currentPlayerIndex` to 0.
- `checkWinner(state: GameState): number | null`
  - Returns player index if their hand is empty, else null.

### Phase 4: AI Layer

**Step 4.1 -- `src/ai/random-ai.ts`**
- `chooseCard(hand: Card[], topCard: Card, currentColor: Color, rng?: () => number): { cardIndex: number; chosenColor?: Color } | null`
  - Gets list of playable card indices.
  - If none, returns `null` (will draw).
  - Otherwise picks a random playable card.
  - If the chosen card is wild, picks a random color.

### Phase 5: Console UI

**Step 5.1 -- `src/ui/renderer.ts`**
- `renderGameState(state: GameState): string` -- formats and returns:
  - Top card on discard pile (with current active color).
  - Computer's card count.
  - Player's hand as a numbered list (e.g., `[1] Red 7  [2] Blue Skip  [3] Wild`).
  - Indicator of whose turn it is.
- `renderComputerAction(action: string): string` -- e.g., "Computer played Blue 5" or "Computer drew a card".
- `renderGameOver(winnerName: string): string`.
- Use ANSI color codes for card colors (red, yellow, green, blue) to make the display readable.

**Step 5.2 -- `src/ui/input.ts`**
- Thin async wrapper around Node `readline`:
  - `askQuestion(prompt: string): Promise<string>`.
  - `askChoice(prompt: string, min: number, max: number): Promise<number>` -- validates numeric input in range, re-prompts on invalid input.
  - `askColor(): Promise<Color>` -- numbered menu for color selection.
  - `close(): void`.

**Step 5.3 -- `src/ui/game-loop.ts`**
- `async runGame(): Promise<void>` -- the main game loop:
  1. Call `initGame()`.
  2. Loop until `state.winner !== null`:
     - Render game state.
     - If current player is human:
       - Show playable cards. Offer option to draw.
       - If player picks a card, call `playCard()`. If wild, ask for color.
       - If player draws, call `drawCard()`. If drawn card is playable, ask play-or-hold.
     - If current player is computer:
       - Call `chooseCard()`.
       - If AI returns a card, call `playCard()`. Display what was played.
       - If AI returns null, call `drawCard()`. Check if drawn card is playable; if so, play it (computer always plays if it can). Display action.
  3. Render game over message.

### Phase 6: Entry Point

**Step 6.1 -- `src/main.ts`**
- Import and call `runGame()`.
- Wrap in try/catch for graceful error handling.
- Handle `SIGINT` for clean exit.

### Phase 7: Tests

**Step 7.1 -- `tests/engine/deck.test.ts`**
- `createDeck()` returns exactly 108 cards.
- Correct distribution: 19 per color for number cards, 2 skips/reverses/draw-twos per color, 4 wilds, 4 wild-draw-fours.
- `shuffle()` with seeded RNG produces deterministic output.
- `shuffle()` does not mutate the original array.

**Step 7.2 -- `tests/engine/match.test.ts`**
- Same color number card is playable.
- Same number different color is playable.
- Different color different number is not playable.
- Action card matches by color.
- Action card matches by action type across colors.
- Wild is always playable.
- Wild Draw Four is always playable.
- `getPlayableCards` returns correct indices.

**Step 7.3 -- `tests/engine/turn.test.ts`**
- Playing a number card moves it to discard pile, removes from hand, advances turn.
- Playing Skip advances turn past next player.
- Playing Draw Two forces next player to draw 2 and skip.
- Playing Wild sets chosen color.
- Playing Wild Draw Four sets color and forces draw 4 + skip.
- Reverse in 2-player does NOT act as skip (turn advances normally).
- Drawing a card when draw pile is empty reshuffles discard pile.
- Win condition detected when hand empties.

**Step 7.4 -- `tests/engine/game.test.ts`**
- `initGame()` produces valid state: 2 players with 7 cards each, discard pile has 1 card, draw pile has remaining cards.
- First card being a Wild results in a random color being set.
- First card being an action card applies its effect.

**Step 7.5 -- `tests/ai/random-ai.test.ts`**
- Returns null when no cards are playable.
- Returns a valid playable card index when options exist.
- Returns a chosen color when playing a wild card.
- With seeded RNG, output is deterministic.

## File Inventory

### New Files

- `package.json` -- project manifest, scripts, dev dependencies
- `tsconfig.json` -- TypeScript configuration
- `.gitignore` -- ignore `node_modules/`, `dist/`
- `src/model/card.ts` -- card types, color type, display utility
- `src/model/game-state.ts` -- GameState and Player interfaces
- `src/model/index.ts` -- barrel export for model
- `src/engine/deck.ts` -- deck creation and shuffle
- `src/engine/match.ts` -- card matching / playability rules
- `src/engine/turn.ts` -- play card, draw card, pass turn
- `src/engine/game.ts` -- game initialization, win check
- `src/engine/index.ts` -- barrel export for engine
- `src/ai/random-ai.ts` -- random card selection strategy
- `src/ai/index.ts` -- barrel export for ai
- `src/ui/renderer.ts` -- game state display formatting with ANSI colors
- `src/ui/input.ts` -- readline wrapper for user input
- `src/ui/game-loop.ts` -- main game loop orchestrating turns
- `src/ui/index.ts` -- barrel export for ui
- `src/main.ts` -- entry point
- `tests/engine/deck.test.ts` -- deck creation and shuffle tests
- `tests/engine/match.test.ts` -- card matching rule tests
- `tests/engine/turn.test.ts` -- turn action tests (play, draw, skip, reverse, wild)
- `tests/engine/game.test.ts` -- game initialization tests
- `tests/ai/random-ai.test.ts` -- AI behavior tests

### Modified Files

None -- this is a greenfield project.

## Testing Strategy

**What to test:** All game rule logic in `src/engine/` and AI logic in `src/ai/`. These are pure functions with no I/O, making them straightforward to test.

**What NOT to test:** The `src/ui/` layer. It depends on stdin/stdout and is thin enough that manual playtesting covers it. If the engine is correct, the UI is just wiring.

**Test patterns:**
- Construct `GameState` objects directly in tests (no need to go through `initGame()`). This lets each test control exactly the state it needs.
- Use a seeded RNG (`() => 0.5` or a simple linear congruential generator) for deterministic shuffle and AI tests.
- Keep tests focused: one behavior per test case. Name tests as sentences describing the rule (e.g., `"Draw Two forces next player to draw 2 cards and skip their turn"`).

**Edge cases to cover:**
- Draw pile exhaustion and reshuffle.
- Playing the last card in hand triggers win.
- First discard card being a Wild or action card.
- Hand with zero playable cards (must draw).
- Drawing a playable card after having no playable cards.

## Migration Notes

Not applicable -- greenfield project with no existing data or code to migrate.

## Build and Run

```bash
npm install
npm start          # play the game
npm test           # run all tests
npm run typecheck  # check types without emitting
```
