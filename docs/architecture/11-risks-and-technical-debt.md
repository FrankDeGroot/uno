# 11. Risks and Technical Debt

## Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Draw pile reshuffle omitted or incorrect | Low | High — game hangs when draw pile empties | Unit test in `tests/engine/turn.test.ts` covers the reshuffle scenario explicitly. |
| Win condition not triggered on the last card | Low | High — game never ends | Unit test verifies that `playCard()` sets `state.winner` when a hand empties. |
| ANSI color codes not supported in the player's terminal | Low | Low — output is readable without color; only visual quality degrades | No mitigation planned; the effect is cosmetic. |
| Action card applied incorrectly on first discard | Medium | Medium — first human turn starts in a broken state | `initGame()` tests cover Wild and action card first-discard scenarios. |

## Technical Debt

| Item | Description | Effort | Priority |
| ---- | ----------- | ------ | -------- |
| Reverse card 2-player behavior | Per official UNO rules, Reverse in a 2-player game should act as Skip (the same player takes another turn). This is intentionally not implemented. Turn resolution treats Reverse as a normal turn advance. | Small — one conditional branch in `turn.ts` | Low — deferred; the game is playable without it |
| No input validation beyond range check | `askChoice()` validates that input is an integer within range but does not guard against edge cases like empty input from a piped stdin source. | Small — additional guard in `input.ts` | Low — not a concern in interactive terminal use |
| UI layer has no automated tests | `src/ui/` is covered only by manual playtesting. A bug in renderer output or the game loop orchestration cannot be caught by `npm test`. | Medium — would require mocking readline or using a testing approach for async I/O | Low — the layer is thin and rule correctness is covered by engine tests |
| No persistent high score or game history | Game state is lost when the process exits. There is no record of past games. | Medium — would require file I/O and a data schema | None planned — out of scope for this project |
