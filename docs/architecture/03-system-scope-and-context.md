# 3. System Scope and Context

## Business Context

WoMiWo is a self-contained two-player UNO game. The human player is the only external actor. There are no external systems, no network calls, no databases, and no third-party services.

```
┌─────────────────────────────────────────┐
│                WoMiWo                   │
│         (UNO Console Game)              │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐  │
│  │  Game Engine│   │  Computer AI    │  │
│  │  (rules)    │   │  (random picks) │  │
│  └─────────────┘   └─────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │           Console UI               │ │
│  │  (stdin input / stdout rendering)  │ │
│  └─────────────────────────────────────┘ │
└───────────────────┬─────────────────────┘
                    │ keystrokes / display
              ┌─────┴──────┐
              │   Player   │
              │(developer) │
              └────────────┘
```

| Communication Partner | Inputs to System | Outputs from System |
| --------------------- | ---------------- | ------------------- |
| Player (human) | Card selection (number), color choice (number), draw decision (number) | Game state display: hand, discard top, computer card count, action log, game-over message |

## Technical Context

The system is a single OS process. All I/O is through the terminal.

```
┌────────────────────────────────────────────┐
│  Node.js process  (tsx src/main.ts)        │
│                                            │
│   src/engine/  ──►  src/ai/               │
│        │                │                  │
│        └──────────────► src/ui/            │
│                          │                 │
│                    readline (built-in)     │
└──────────────────────────┬─────────────────┘
                           │
                    Terminal (stdin / stdout)
                           │
                        Player
```

| Technical Interface | Description |
| ------------------- | ----------- |
| Terminal stdin | Node.js `readline` module reads lines typed by the player. Input is validated numerically; invalid input triggers a re-prompt. |
| Terminal stdout | `process.stdout` (via `console.log` and ANSI escape codes) renders game state, menus, and messages. |
| No file I/O | No configuration files, save files, or logs are read from or written to disk. |
| No network I/O | The system makes no outbound or inbound network connections. |
