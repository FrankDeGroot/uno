---
name: WoMiWo project context
description: Console UNO card game in TypeScript -- greenfield project, single player vs random AI, no source code yet as of 2026-04-08
type: project
---

WoMiWo is a console-based UNO card game built in TypeScript. Single player vs random-AI computer opponent. Standard 108-card deck, no "UNO" call mechanic, Reverse not special-cased in 2-player.

**Why:** Learning project for using agentic AI to build a simple application.

**How to apply:** All features ship in a single milestone. Architecture docs exist as empty arc42 scaffolds under `docs/architecture/`. Implementation plan is at `docs/plans/FEAT-001-uno-console-game.md`. Tech stack: TypeScript, tsx runner, Vitest, Node readline (no runtime deps). Three-layer architecture: model (types), engine (pure game logic), ui (console I/O).
