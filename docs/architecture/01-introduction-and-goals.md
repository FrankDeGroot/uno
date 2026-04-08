# 1. Introduction and Goals

## Requirements Overview

WoMiWo is a console-based UNO card game implemented in TypeScript. A single human player competes against one computer opponent in a standard two-player UNO game. The system runs entirely in a Node.js process; all interaction occurs through terminal stdin and stdout.

Functional scope:

- Standard 108-card UNO deck: number cards (0–9) in four colors, action cards (Skip, Reverse, Draw Two), and wild cards (Wild, Wild Draw Four).
- Deck shuffling and dealing 7 cards to each player at game start.
- Draw pile with automatic reshuffle of the discard pile when exhausted.
- Card matching rules: a card is playable if it matches the top discard card by color, by number, by action type, or is a wild card.
- Action card effects: Skip skips the next player's turn; Reverse advances the turn normally in a 2-player game; Draw Two forces the next player to draw 2 cards and lose their turn; Wild Draw Four forces the next player to draw 4 cards and lose their turn.
- Wild card color selection: the playing party chooses the active color after playing a Wild or Wild Draw Four.
- Win condition: the first player to empty their hand wins.
- Computer opponent selects a random valid card from its hand each turn.
- Console UI displays the player's hand, the top discard card with active color, the computer's card count, and a log of computer actions.

Out of scope: the "UNO" last-card callout penalty, card challenge mechanics, and strategic AI logic.

## Quality Goals

| Priority | Quality Goal | Motivation |
| -------- | ------------ | ---------- |
| 1 | Rules correctness | All UNO card effects and matching rules must behave exactly as specified. Incorrect rule logic directly breaks playability. |
| 2 | Testability | Engine logic must be exercisable via pure function calls with no I/O setup. Tests are the primary verification mechanism for game rules. |
| 3 | Simplicity | The codebase is a learning project. Complexity beyond what the problem demands — extra dependencies, abstractions, or build steps — is a liability. |

## Stakeholders

| Role | Expectations |
| ---- | ------------ |
| Developer / Player (sole user) | A working, playable UNO game that runs from the terminal; correct rule behavior; readable source code that demonstrates clean TypeScript architecture. |
