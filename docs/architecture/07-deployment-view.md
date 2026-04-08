# 7. Deployment View

## Infrastructure Level 1

WoMiWo runs as a single Node.js process on the developer's local machine. There is no server, no container, no cloud infrastructure.

```
┌─────────────────────────────────────────┐
│          Developer's Machine            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         Node.js Process           │  │
│  │                                   │  │
│  │  tsx src/main.ts                  │  │
│  │  ├── src/model/                   │  │
│  │  ├── src/engine/                  │  │
│  │  ├── src/ai/                      │  │
│  │  └── src/ui/                      │  │
│  │                                   │  │
│  │  stdin ◄──── Terminal             │  │
│  │  stdout ───► Terminal             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Runtime: Node.js (LTS)                 │
│  Executor: tsx (devDependency)          │
└─────────────────────────────────────────┘
```

| Node | Description |
| ---- | ----------- |
| Developer's machine | Any OS with Node.js LTS installed. No environment-specific configuration. |
| Node.js process | Single process started by `npm start` (`tsx src/main.ts`). Exits when the game ends or the player presses Ctrl+C. |
| Terminal | The player's shell session provides stdin and stdout. No PTY or terminal emulator requirements beyond basic ANSI escape code support for color rendering. |

## Infrastructure Level 2

No additional deployment nodes. The project does not use Docker, virtual machines, or remote execution environments.

## Mapping: Building Blocks to Infrastructure

All building blocks run in the single Node.js process. There is no distribution across nodes.

| Building Block | Infrastructure Node |
| -------------- | ------------------- |
| `src/model/` | Node.js process |
| `src/engine/` | Node.js process |
| `src/ai/` | Node.js process |
| `src/ui/` | Node.js process |
| `src/main.ts` | Node.js process (entry point) |

## Run Commands

```bash
npm install          # install devDependencies (tsx, typescript, vitest, @types/node)
npm start            # play the game  (tsx src/main.ts)
npm test             # run all tests  (vitest run)
npm run typecheck    # type-check without emitting  (tsc --noEmit)
```

No build step is required to play the game. `tsx` executes TypeScript source directly.
