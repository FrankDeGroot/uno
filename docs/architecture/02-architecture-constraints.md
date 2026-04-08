# 2. Architecture Constraints

## Technical Constraints

| Constraint | Explanation |
| ---------- | ----------- |
| TypeScript | The implementation language is TypeScript. JavaScript is not acceptable. |
| Node.js runtime | The game runs as a Node.js process. No browser target, no Deno, no Bun. |
| Console I/O only | All user interaction is via terminal stdin and stdout. No GUI, no web server, no file system state. |
| No runtime dependencies | `package.json` has zero `dependencies`. All external packages are `devDependencies` (TypeScript toolchain and test framework only). |
| Node.js `readline` for input | User input is handled with the built-in `readline` module. No third-party input or CLI libraries (e.g., `inquirer`, `prompts`, `commander`). |
| Vitest for testing | The test framework is Vitest. No Jest, no Mocha. Vitest provides zero-config ESM and native TypeScript support without additional transpilation setup. |
| `tsx` as the runtime executor | The game is run directly with `tsx` (`npm start`). No compiled `dist/` output is required to play. `tsc --noEmit` is used for type checking only. |
| ES2022 / Node16 module resolution | `tsconfig.json` targets ES2022 with `"module": "Node16"` and `"moduleResolution": "Node16"`. |

## Organizational Constraints

| Constraint | Explanation |
| ---------- | ----------- |
| Single developer | There is one developer. No code review process, no CI pipeline, no branching strategy beyond personal preference. |
| Single milestone | All features ship together. There is no phased release or version roadmap beyond the MVP. |
| Learning project | Architectural decisions favor clarity and learnability over production-grade operational concerns (monitoring, resilience, deployment automation). |

## Conventions

| Convention | Explanation |
| ---------- | ----------- |
| `src/` flat module folders | Source is organized as `src/model/`, `src/engine/`, `src/ai/`, `src/ui/`, and `src/main.ts`. No monorepo, no deep nesting. |
| Barrel exports | Each module folder exposes an `index.ts` re-exporting its public surface. |
| Tests mirror source structure | Test files live under `tests/engine/` and `tests/ai/`, mirroring the source layout. |
| Sentence-style test names | Vitest test descriptions are written as full sentences describing the rule being verified (e.g., `"Draw Two forces next player to draw 2 cards and skip their turn"`). |
