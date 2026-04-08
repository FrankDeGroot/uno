# 6. Runtime View

## Scenario 1: Game Initialization

`main.ts` calls `runGame()`, which calls `initGame()` to produce the initial `GameState`.

```
main.ts        game-loop.ts       engine/game.ts      engine/deck.ts
   │                │                   │                   │
   │──runGame()────►│                   │                   │
   │                │──initGame()──────►│                   │
   │                │                   │──createDeck()────►│
   │                │                   │◄──────────────────│
   │                │                   │──shuffle()────────►│
   │                │                   │◄──────────────────│
   │                │                   │  deal 7 cards each │
   │                │                   │  flip first discard│
   │                │◄──GameState───────│                   │
   │                │  renderGameState()│                   │
   │                │──► stdout         │                   │
```

`initGame()` creates the deck, shuffles it, deals 7 cards to each player, and flips the top card to the discard pile. If the first discard is a Wild, a random color is assigned. If it is an action card, its effect is applied before the human player's first turn.

## Scenario 2: Human Player Turn

```
game-loop.ts        ui/input.ts       engine/turn.ts
     │                   │                  │
     │  renderGameState() → stdout           │
     │  show playable cards / draw option    │
     │──askChoice()──────►│                  │
     │◄──cardIndex────────│                  │
     │                                       │
     │  [if wild: askColor() → chosenColor]  │
     │                                       │
     │──playCard(state, cardIndex, color?)──►│
     │◄──newState────────────────────────────│
     │  update state, check winner           │
```

If the player has no playable cards or chooses to draw:

```
game-loop.ts        ui/input.ts       engine/turn.ts
     │──drawCard(state)────────────────────►│
     │◄──{ state, drawnCard }───────────────│
     │  [if drawnCard is playable: askChoice play-or-hold]
     │  [if play: playCard(); else: passTurn()]
```

## Scenario 3: Computer Opponent Turn

```
game-loop.ts        ai/random-ai.ts    engine/turn.ts
     │                    │                  │
     │──chooseCard(...)──►│                  │
     │◄──{ cardIndex, chosenColor } or null──│
     │                                       │
     │  [if card chosen]                     │
     │──playCard(state, cardIndex, color?)──►│
     │◄──newState────────────────────────────│
     │                                       │
     │  [if null: drawCard()]                │
     │──drawCard(state)────────────────────►│
     │◄──{ state, drawnCard }───────────────│
     │  [if drawnCard playable: playCard()]  │
     │                                       │
     │  renderComputerAction() → stdout      │
```

## Scenario 4: Draw Pile Exhaustion

```
engine/turn.ts            (internal)
     │
     │──drawCard(state)
     │  draw pile is empty
     │  take discard pile except top card
     │  shuffle into new draw pile
     │  draw from new pile
     │◄──{ state, drawnCard }
```

This reshuffle is transparent to the game loop and UI.

## Error/Edge Case Scenarios

| Scenario | Handling |
| -------- | -------- |
| Draw pile exhausted | `drawCard()` reshuffles the discard pile (minus the top card) into a new draw pile before drawing. |
| Invalid player input | `askChoice()` re-prompts the player with an error message until a valid number in range is entered. |
| `SIGINT` (Ctrl+C) | `main.ts` registers a `SIGINT` handler that closes the `readline` interface and exits cleanly. |
| Unhandled error in game loop | `main.ts` wraps `runGame()` in a `try/catch` that prints the error and exits with a non-zero code. |
