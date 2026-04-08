# 4. Solution Strategy

## Technology Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Language | TypeScript (strict mode) | Required by project constraints; provides type safety for the discriminated union card model. |
| Runtime executor | `tsx` (esbuild-backed) | Runs TypeScript directly without a compile step. Appropriate for a dev/learning project where a `dist/` pipeline adds no value. |
| Test framework | Vitest | Zero-config ESM and TypeScript support; fast execution; no Babel or ts-jest required. |
| Input handling | Node.js built-in `readline` | Interaction model is simple numbered menus. A third-party library would add a dependency for no meaningful benefit. |
| No runtime dependencies | Zero `dependencies` in `package.json` | Keeps the project self-contained and free of supply-chain risk. |

## Top-level Decomposition

The system is divided into three layers and one supporting module:

- **`src/model/`** — Pure data type definitions. No logic. Defines `Card` (discriminated union), `Color`, `ActionType`, `WildType`, `Player`, and `GameState`. Also provides `cardDisplayName()` for rendering.
- **`src/engine/`** — All game logic. Pure functions that take `GameState` and return `GameState`. No I/O. Covers deck construction, shuffling, card matching, turn resolution, draw pile reshuffle, and win detection.
- **`src/ai/`** — Computer opponent strategy. A single function `chooseCard()` that selects a random valid card from the AI's hand. Pluggable: replacing the function with a smarter strategy requires no changes elsewhere.
- **`src/ui/`** — Imperative shell. The game loop, renderer, and `readline` input wrapper. This is the only layer that performs I/O. It orchestrates calls to `engine` and `ai` and drives the terminal display.

## Approaches to Achieve Quality Goals

| Quality Goal | Approach |
| ------------ | -------- |
| Rules correctness | All game logic lives in `src/engine/` as pure functions. Tests in `tests/engine/` call these functions directly with crafted `GameState` objects and assert outcomes. No mocking of I/O is required. |
| Testability | Functional-core, imperative-shell pattern: state is a plain `GameState` object; engine functions are `(state) => state`. The `ui/` layer is explicitly excluded from automated testing. The shuffle and AI functions accept an optional RNG parameter for deterministic test execution. |
| Simplicity | Flat `src/` module structure, no monorepo, no build pipeline, no config beyond `tsconfig.json` and `package.json`. The entire project fits in a single `src/` tree with one level of module folders. |

## Organizational Decisions

This is a single-developer project with no team coordination requirements. All implementation decisions are made by the developer. There is no formal review process. The implementation plan (`docs/plans/FEAT-001-uno-console-game.md`) serves as the authoritative specification during development.
