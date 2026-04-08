# 9. Architecture Decisions

## Decision Log

| ID | Decision | Status | Date |
| -- | -------- | ------ | ---- |
| ADR-001 | Use `tsx` as the runtime executor instead of a `tsc` build pipeline | Accepted | 2026-04-08 |
| ADR-002 | Use Node.js built-in `readline` instead of a CLI input library | Accepted | 2026-04-08 |
| ADR-003 | Functional-core, imperative-shell architecture | Accepted | 2026-04-08 |
| ADR-004 | Computer AI is a single pluggable strategy function using random selection | Accepted | 2026-04-08 |
| ADR-005 | Reverse card in 2-player is not special-cased as Skip | Accepted | 2026-04-08 |
| ADR-006 | Vitest as the test framework | Accepted | 2026-04-08 |
| ADR-007 | No "UNO" callout penalty mechanic | Accepted | 2026-04-08 |

---

### ADR-001: Use `tsx` instead of a `tsc` build pipeline

**Context:** TypeScript projects typically compile source to JavaScript (`tsc`) before execution. For a dev/learning project, this adds a build step with no user-facing benefit.

**Decision:** Use `tsx` (an esbuild-backed TypeScript executor) to run `src/main.ts` directly via `npm start`. `tsconfig.json` is retained for editor support and `tsc --noEmit` type checking.

**Consequences:** No `dist/` directory is produced or required. Build times are eliminated. Type errors are caught by `tsc --noEmit` and by the IDE, not by a compile step in the run path.

---

### ADR-002: Use Node.js `readline` instead of a CLI input library

**Context:** Libraries such as `inquirer` and `prompts` provide rich interactive menus. The interaction model here is simple numbered lists.

**Decision:** Wrap Node.js `readline` directly in `src/ui/input.ts` with three helper functions: `askQuestion`, `askChoice`, and `askColor`.

**Consequences:** Zero runtime dependencies. The wrapper is ~30 lines. Input validation (range check, re-prompt on invalid) is implemented inline.

---

### ADR-003: Functional-core, imperative-shell architecture

**Context:** Mixing I/O into game logic makes unit testing require mocks or integration harnesses.

**Decision:** All game logic in `src/engine/` is pure functions: `(GameState, ...args) => GameState`. The `src/ui/` layer is the sole site of I/O and holds the current `state` reference.

**Consequences:** Engine tests require no mocking. Any test can construct a `GameState` directly and call engine functions. The UI layer is thin enough to verify through manual playtesting.

---

### ADR-004: AI is a pluggable strategy function

**Context:** AI logic may evolve. Coupling it to engine internals would make replacement costly.

**Decision:** The AI is a single function `chooseCard(hand, topCard, currentColor, rng?): { cardIndex, chosenColor? } | null`. The current implementation picks randomly from valid cards.

**Consequences:** Replacing the AI with a smarter strategy requires changing only `src/ai/random-ai.ts` and its export. The game loop does not need to change.

---

### ADR-005: Reverse card in 2-player is not special-cased as Skip

**Context:** In standard UNO rules, Reverse in a 2-player game acts as a Skip (the same player takes another turn). Implementing this requires detecting the 2-player case and branching.

**Decision:** Reverse advances the turn normally (to the next player). It does not act as a Skip in this implementation. This is a known deviation from official rules, documented as deferred technical debt.

**Consequences:** The 2-player Reverse edge case does not behave per official UNO rules. Turn resolution logic is simpler. See section 11 for the corresponding debt item.

---

### ADR-006: Vitest as the test framework

**Context:** Jest is the historical default but requires `ts-jest` or Babel for TypeScript. Vitest has native ESM and TypeScript support with zero additional configuration.

**Decision:** Use Vitest. Test script: `"test": "vitest run"`.

**Consequences:** No `jest.config.js`, no `ts-jest`, no Babel. Tests run faster. The Vitest API is compatible with Jest for common patterns (`describe`, `it`, `expect`).

---

### ADR-007: No "UNO" callout penalty mechanic

**Context:** Official UNO rules require a player to call "UNO" when playing to one card; failure to call can result in a penalty draw.

**Decision:** The callout mechanic is excluded. A player wins by emptying their hand without any callout requirement.

**Consequences:** Reduced UI complexity (no callout prompt, no penalty trigger). The game is slightly less faithful to official rules but meaningfully simpler to implement and play in a console context.
