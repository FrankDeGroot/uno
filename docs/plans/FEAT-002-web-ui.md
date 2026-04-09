# Implementation Plan: Web UI (FEAT-002)

**Spec:** `docs/product/impact-map.md`
**Created:** 2026-04-09
**Status:** Implemented

## Summary

Add a browser-based UI that runs alongside the existing console game. The engine and AI layers are shared; no existing code was modified. The web server handles game state server-side and exposes a JSON HTTP API consumed by a vanilla JS browser client.

## Key Design Decisions

1. **HTTP API server, engine stays on Node.** The engine runs server-side; the browser sends actions via `fetch` and receives full `GameState` snapshots as JSON. No bundler, no TypeScript in the browser. Rejected alternatives: bundling engine for browser (requires build step), WebSockets (overkill for turn-based game, adds runtime dep).

2. **No runtime dependencies.** The server uses `node:http`, `node:fs`, and `node:url` only. The browser client is a single vanilla JS file.

3. **Single-session in-memory state.** One `GameState` is held in module scope. Two browser tabs share the same game. Acceptable for a rudimentary UI.

4. **AI turns run synchronously on the server after each human action.** After a `"play"` or `"pass"` action the server loops through AI turns before responding, so the browser always receives a state where it is the human's turn (or the game is over). No polling needed.

5. **Draw flow is two-step.** A `"draw"` action returns state with `drawnCardIndex` set (still the human's turn). If the drawn card is playable, the browser offers play or pass. A separate `"pass"` action completes the turn and triggers AI. If the drawn card is not playable, the server immediately passes and runs AI turns before responding.

6. **`playableIndices` computed server-side.** The server includes `playableIndices: number[]` in every response so the browser can enable/disable card buttons without duplicating matching logic in JavaScript.

## Implementation Steps

### Step 1 — `package.json`: add `"web"` script
```json
"web": "tsx src/web-main.ts"
```

### Step 2 — `src/web-main.ts`
Entry point; imports and calls `startServer(3000)`.

### Step 3 — `src/web/server.ts`
- Holds `GameState` in module scope.
- Routes: `GET /` (index.html), `GET /public/*` (static files), `POST /action` (game actions).
- Action types: `"new-game"`, `"play"` (+ `cardIndex`, optional `chosenColor`), `"draw"`, `"pass"`.
- Response shape: `{ state, playableIndices, lastComputerAction, drawnCardIndex }`.
- Uses `fileURLToPath` + `new URL("./public/", import.meta.url)` for ESM-safe path resolution on Windows.

### Step 4 — `src/web/public/index.html`
Sections: `#info` (top card, active color, computer count), `#hand` (card buttons), `#actions` (Draw, Pass, New Game), `#message` (status/game-over), `#color-picker` (hidden, shown on wild play).

### Step 5 — `src/web/public/style.css`
Color classes `.card-red/yellow/green/blue/wild`, flex hand layout, disabled card styling, dark theme.

### Step 6 — `src/web/public/game.js`
Vanilla JS (~130 lines). Manages `pendingWildIndex` and `hasDrawn` client state. All UNO rule logic remains on the server.

## File Inventory

### New Files
- `src/web-main.ts` — entry point
- `src/web/server.ts` — HTTP server, action dispatcher, AI runner
- `src/web/public/index.html` — HTML shell
- `src/web/public/style.css` — card and layout styles
- `src/web/public/game.js` — browser-side fetch and render logic

### Modified Files
- `package.json` — added `"web"` script

## Build and Run

```bash
npm run web     # start web server at http://localhost:3000
npm start       # console game (unchanged)
npm test        # 37 tests, all pass (engine unchanged)
```
