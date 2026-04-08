# 5. Building Block View

## Level 1: Overall System

```
┌──────────────────────────────────────────────────────┐
│                      WoMiWo                          │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────┐   ┌──────┐  │
│  │  model   │   │  engine  │   │  ai  │   │  ui  │  │
│  └──────────┘   └──────────┘   └──────┘   └──────┘  │
│       ▲               ▲           ▲           ▲      │
│       └───────────────┴───────────┴───────────┘      │
│                   (all import model)                 │
│               engine ◄── ai                          │
│               engine ◄── ui                          │
│               ai     ◄── ui                          │
└──────────────────────────────────────────────────────┘
```

| Building Block | Responsibility |
| -------------- | -------------- |
| `model` | Pure data type definitions: `Card`, `Color`, `ActionType`, `WildType`, `Player`, `GameState`, and the `cardDisplayName()` display utility. No logic, no I/O. |
| `engine` | All game rule logic as pure functions: deck creation, Fisher-Yates shuffle, card matching, turn resolution (play, draw, pass), draw pile reshuffle, game initialization, and win detection. |
| `ai` | Computer opponent strategy: `chooseCard()` selects a random valid card from the AI hand and, if that card is wild, selects a random color. Returns `null` when no card is playable. |
| `ui` | Imperative shell: console renderer (ANSI-colored output), `readline` input wrapper, and the async game loop that orchestrates human turns and computer turns until a winner is found. |

## Level 2: Component Details

### `src/model/`

Provides shared data types imported by all other modules.

| File | Contents |
| ---- | -------- |
| `card.ts` | `Color`, `NumberValue`, `ActionType`, `WildType`; discriminated union `Card` (`NumberCard \| ActionCard \| WildCard`); `cardDisplayName(card): string` |
| `game-state.ts` | `Player` interface (`name`, `hand`); `GameState` interface (`drawPile`, `discardPile`, `players`, `currentPlayerIndex`, `currentColor`, `winner`) |
| `index.ts` | Barrel re-export |

### `src/engine/`

Pure game logic. No imports from `ai` or `ui`.

| File | Key Exports |
| ---- | ----------- |
| `deck.ts` | `createDeck(): Card[]` — builds the standard 108-card deck; `shuffle(cards, rng?): Card[]` — Fisher-Yates, accepts optional RNG |
| `match.ts` | `canPlay(card, topCard, currentColor): boolean`; `getPlayableCards(hand, topCard, currentColor): number[]` |
| `turn.ts` | `playCard(state, cardIndex, chosenColor?): GameState`; `drawCard(state): { state, drawnCard }`; `passTurn(state): GameState` |
| `game.ts` | `initGame(rng?): GameState`; `checkWinner(state): number \| null` |
| `index.ts` | Barrel re-export |

### `src/ai/`

Depends on `model` and `engine` (for `getPlayableCards`). No I/O.

| File | Key Exports |
| ---- | ----------- |
| `random-ai.ts` | `chooseCard(hand, topCard, currentColor, rng?): { cardIndex: number; chosenColor?: Color } \| null` |
| `index.ts` | Barrel re-export |

### `src/ui/`

The imperative shell. Depends on `model`, `engine`, and `ai`. Performs all I/O.

| File | Key Exports |
| ---- | ----------- |
| `renderer.ts` | `renderGameState(state): string`; `renderComputerAction(action): string`; `renderGameOver(winnerName): string` — all return strings printed by the game loop |
| `input.ts` | `askQuestion(prompt): Promise<string>`; `askChoice(prompt, min, max): Promise<number>`; `askColor(): Promise<Color>`; `close(): void` |
| `game-loop.ts` | `runGame(): Promise<void>` — main async game loop |
| `index.ts` | Barrel re-export |

### `src/main.ts`

Entry point. Calls `runGame()`, wraps in `try/catch` for error handling, and registers a `SIGINT` handler for clean exit.

## Level 3: Internal Structure

No further decomposition is architecturally significant at this project scale.
