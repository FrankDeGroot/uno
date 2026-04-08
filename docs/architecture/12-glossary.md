# 12. Glossary

## UNO Domain Terms

| Term | Definition |
| ---- | ---------- |
| Action Card | A colored card with a special effect rather than a numeric value. The three action types are Skip, Reverse, and Draw Two. |
| Color Match | A card is playable by color match if its color equals the current active color (`GameState.currentColor`). |
| Current Color | The active color in effect for the current turn. Normally the color of the top discard card; overridden by the color chosen when a Wild card is played. |
| Discard Pile | The face-up pile of cards that have been played. Only the top card (and its associated current color) is relevant for matching. |
| Draw Pile | The face-down pile of undealt cards from which players draw when they cannot or choose not to play. When exhausted, the discard pile (minus the top card) is reshuffled into a new draw pile. |
| Draw Two | An action card that forces the next player to draw 2 cards and forfeit their turn. |
| Hand | The set of cards currently held by a player. A player wins by emptying their hand. |
| Number Card | A card bearing a numeric value (0–9) and a color. Playable by color match or number match. |
| Number Match | A card is playable by number match if its numeric value equals the top discard card's value, regardless of color. |
| Reverse | An action card that reverses the direction of play. In a 2-player game in this implementation, Reverse advances the turn normally (direction reversal has no meaningful effect with two players). |
| Skip | An action card that causes the next player to forfeit their turn. |
| Symbol Match | A card is playable by symbol match if its action type equals the top discard card's action type, regardless of color (e.g., any Skip is playable on top of any other Skip). |
| Wild | A card with no color that can be played on any card. The player who plays it chooses the active color for the next turn. |
| Wild Draw Four | A Wild card that additionally forces the next player to draw 4 cards and forfeit their turn. The playing party chooses the active color. |
| Win Condition | The first player whose hand reaches zero cards wins the game. |

## Technical Terms

| Term | Definition |
| ---- | ---------- |
| Discriminated Union | A TypeScript union type where each member has a literal `kind` field used to narrow the type at compile time. Used for the `Card` type. |
| Fisher-Yates Shuffle | An in-place array shuffle algorithm that produces an unbiased random permutation. Used in `engine/deck.ts`. |
| Functional Core | The portion of the architecture (`src/engine/`, `src/ai/`) composed of pure functions with no side effects or I/O dependencies. |
| GameState | The central plain-object data structure holding the complete state of one game: draw pile, discard pile, both players' hands, current player, current color, and winner. |
| Imperative Shell | The portion of the architecture (`src/ui/`) that performs I/O, holds mutable references, and orchestrates calls into the functional core. |
| Pluggable Strategy | A design where the AI logic is encapsulated in a single replaceable function (`chooseCard`), allowing the strategy to be swapped without modifying any other code. |
| Seeded RNG | A random number generator initialized with a fixed value so that its output sequence is deterministic and reproducible. Used in tests to make shuffle and AI behavior predictable. |
| tsx | An esbuild-backed TypeScript executor that runs `.ts` files directly without a compile step. Used as the production runner via `npm start`. |
