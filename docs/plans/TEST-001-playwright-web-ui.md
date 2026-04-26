# Test Plan: Playwright Web UI Tests (TEST-001)

**Created:** 2026-04-26
**Status:** Implemented

## Context

WoMiWo is a browser-based UNO card game. Server: Node.js HTTP on port 3000 (`npm run web`). Playwright tests cover main user-facing features. Tests are resilient to nondeterminism (random card dealing each game).

## Approach

Single test script at `tests/web/playwright-web-ui.ts` covering 6 feature areas. Each test section navigates to a fresh page (auto-triggers new game on load). Uses `headless: false`, `slowMo: 100` for visibility.

## Test Scenarios

### 1. Page Load
- Navigate to `http://localhost:3000`
- Assert title = `"WoMiWo UNO"`
- Assert sections exist: `#info`, `#message-area`, `#hand-area`, `#actions`
- Assert "New Game" button visible

### 2. New Game Initialization
- Assert `#hand button` count > 0 (player has cards)
- Assert `#computer-count` contains a number
- Assert `#top-card` rendered (not `—`)
- Assert "Draw Card" button enabled

### 3. Draw Card
- Click "Draw Card" button, wait for server response
- **Playable drawn card** → draw button disabled, pass button visible
- **Unplayable drawn card** → server auto-passes, AI runs, draw button re-enabled, hand grew
- Assert: button disabled OR hand count increased

### 4. Play a Non-Wild Card
- Find first enabled non-wild card in `#hand`
- Click it, wait for response
- Assert top card changed OR game-over message shown
- Retries up to 5 new games if no non-wild playable card dealt

### 5. Wild Card Color Picker
- Find enabled wild card in `#hand`
- Click wild card → assert `#color-picker` becomes visible
- Click "Blue" → assert picker hides, `#active-color` = `"blue"`
- Retries up to 5 new games if no wild card dealt; skipped if never dealt

### 6. New Game Reset
- Draw a card to mutate state
- Click "New Game", wait for hand to render
- Assert pass button hidden
- Assert draw button enabled
- Assert top card rendered

## Key Behavioral Notes

- Server auto-passes on draw when drawn card is unplayable (no pass button shown, turn transitions immediately)
- `#color-picker` is rendered client-side before server call; hides after server responds
- `#message.gameover` class signals game-over state
- Wild card play is a two-step interaction: click wild → pick color → server action

## Conventions

- Test files: TypeScript (`.ts`), placed in `tests/web/`
- Imports: ESM `import` syntax — `import { chromium } from 'playwright'`
- `playwright` is a project devDependency (`npm install --save-dev playwright`)
- Run via `npx tsx`, not via the playwright-skill's `run.js` (JS only)
- Type caught errors as `(e as Error).message`

## Execution

```bash
# Start server
npm run web

# Run tests
npx tsx tests/web/playwright-web-ui.ts
```

All 6 test sections print `✅` on pass or `❌` with detail on fail. Screenshot saved to `/tmp/womino-final.png`.
