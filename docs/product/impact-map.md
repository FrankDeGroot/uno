# Impact Map: WoMiWo (UNO Console Game)

## Goals

| Goal | Why | Success Criteria |
|------|-----|-----------------|
| Build a playable console UNO card game against the computer in TypeScript | Learn how to use agentic AI to create a simple application | A working, playable game exists and runs in the console |

## Personas

| Persona | Needs | Problems | Related Goals |
|---------|-------|----------|---------------|
| Player (developer/sole user) | Play a complete game of UNO against the computer via the console | No game exists yet | Build a playable console UNO game |

## Epics and Features

| Epic | Feature | Persona | Need/Problem Addressed | Related Goal |
|------|---------|---------|----------------------|--------------|
| Card Engine | Standard 108-card UNO deck (number cards 0-9 in 4 colors, Skip, Reverse, Draw Two, Wild, Wild Draw Four) | Player | Play a complete game of UNO | Build a playable console UNO game |
| Card Engine | Shuffle deck and deal 7 cards to each player | Player | Play a complete game of UNO | Build a playable console UNO game |
| Card Engine | Draw pile with reshuffle when exhausted | Player | Play a complete game of UNO | Build a playable console UNO game |
| Game Rules | Card matching rules (match by color, number, or symbol) | Player | Play a complete game of UNO | Build a playable console UNO game |
| Game Rules | Action card effects (Skip, Reverse, Draw Two) | Player | Play a complete game of UNO | Build a playable console UNO game |
| Game Rules | Wild and Wild Draw Four play and color choice | Player | Play a complete game of UNO | Build a playable console UNO game |
| Game Rules | Win condition (first player to empty their hand) | Player | Play a complete game of UNO | Build a playable console UNO game |
| Game Rules | Unit tests for all game rule logic | Player | Correctness of game rules | Build a playable console UNO game |
| Computer Opponent | AI that picks a random valid card from its hand | Player | Play against the computer | Build a playable console UNO game |
| Console UI | Display player's hand, discard pile top card, and computer's card count | Player | See game state | Build a playable console UNO game |
| Console UI | Player selects a card to play or chooses to draw | Player | Make decisions during the game | Build a playable console UNO game |
| Console UI | Player chooses color when playing a Wild card | Player | Make decisions during the game | Build a playable console UNO game |
| Console UI | After drawing, player chooses to play or hold the drawn card | Player | Make decisions during the game | Build a playable console UNO game |
| Console UI | Display computer's actions (what it played or that it drew) | Player | Follow what the opponent does | Build a playable console UNO game |
| Console UI | Game over message showing the winner | Player | Game completion | Build a playable console UNO game |

## Roadmap

### MVP (Complete Console Game) -- Single Milestone

All 15 features ship together as one milestone. The scope is small enough that splitting into multiple releases would add overhead without value.

| Epic | Feature |
|------|---------|
| Card Engine | Standard 108-card UNO deck |
| Card Engine | Shuffle deck and deal 7 cards |
| Card Engine | Draw pile with reshuffle when exhausted |
| Game Rules | Card matching rules (color, number, symbol) |
| Game Rules | Action card effects (Skip, Reverse, Draw Two) |
| Game Rules | Wild and Wild Draw Four play and color choice |
| Game Rules | Win condition (empty hand wins) |
| Game Rules | Unit tests for all game rule logic |
| Computer Opponent | AI picks a random valid card |
| Console UI | Display player's hand, discard pile top card, and computer's card count |
| Console UI | Player selects a card to play or chooses to draw |
| Console UI | Player chooses color when playing a Wild card |
| Console UI | After drawing, player chooses to play or hold the drawn card |
| Console UI | Display computer's actions |
| Console UI | Game over message showing the winner |

### 1.0 -- N/A

MVP is the complete product.

### Beyond 1.0 -- Empty

No deferred features. Scope is intentionally tight.

## Key Decisions

- **TypeScript** is the required implementation language.
- **No "UNO" call mechanic** -- the last-card callout penalty is excluded to reduce complexity.
- **Computer AI is random** -- the opponent picks a random valid card, no strategic logic.
- **Reverse in 2-player** -- not special-cased to act as Skip (deferred edge case).
- **Single milestone** -- all features ship together; no phased releases.
