import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { GameState, Color } from "../model/index.js";
import { initGame, playCard, drawCard, passTurn, getPlayableCards } from "../engine/index.js";
import { chooseCard } from "../ai/index.js";

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
};

const PUBLIC_DIR = new URL("./public/", import.meta.url);

interface ActionResponse {
  state: GameState;
  playableIndices: number[];
  lastComputerAction: string;
  drawnCardIndex: number | null;
}

type ActionPayload =
  | { type: "new-game" }
  | { type: "play"; cardIndex: number; chosenColor?: Color }
  | { type: "draw" }
  | { type: "pass" };

let state: GameState = initGame();

function topCard(s: GameState) {
  return s.discardPile[s.discardPile.length - 1];
}

function runAiTurns(s: GameState): { state: GameState; actions: string[] } {
  const actions: string[] = [];
  while (s.currentPlayerIndex === 1 && s.winner === null) {
    const top = topCard(s);
    const result = chooseCard(s.players[1].hand, top, s.currentColor);
    if (result === null) {
      const { state: afterDraw, drawnCard } = drawCard(s);
      s = afterDraw;
      const top2 = topCard(s);
      const drawnIndex = s.players[1].hand.length - 1;
      const canPlay = getPlayableCards([drawnCard], top2, s.currentColor).length > 0;
      if (canPlay) {
        const card = s.players[1].hand[drawnIndex];
        let chosenColor: Color | undefined;
        if (card.kind === "wild") {
          const colors: Color[] = ["red", "yellow", "green", "blue"];
          chosenColor = colors[Math.floor(Math.random() * 4)];
        }
        s = playCard(s, drawnIndex, chosenColor);
        actions.push(`drew and played ${cardLabel(card)}${chosenColor ? ` → ${chosenColor}` : ""}`);
      } else {
        s = passTurn(s);
        actions.push("drew a card");
      }
    } else {
      const card = s.players[1].hand[result.cardIndex];
      s = playCard(s, result.cardIndex, result.chosenColor);
      actions.push(`played ${cardLabel(card)}${result.chosenColor ? ` → ${result.chosenColor}` : ""}`);
    }
  }
  return { state: s, actions };
}

function cardLabel(card: GameState["players"][0]["hand"][0]): string {
  if (card.kind === "number") return `${card.color} ${card.value}`;
  if (card.kind === "action") return `${card.color} ${card.action}`;
  return card.wildType === "wild-draw-four" ? "Wild Draw Four" : "Wild";
}

function makeResponse(s: GameState, lastComputerAction: string, drawnCardIndex: number | null): ActionResponse {
  const top = topCard(s);
  const playable = s.winner !== null
    ? []
    : getPlayableCards(s.players[0].hand, top, s.currentColor);
  return { state: s, playableIndices: playable, lastComputerAction, drawnCardIndex };
}

function handleAction(payload: ActionPayload): ActionResponse {
  if (payload.type === "new-game") {
    state = initGame();
    const { state: s, actions } = runAiTurns(state);
    state = s;
    return makeResponse(state, actions.join("; "), null);
  }

  if (payload.type === "play") {
    state = playCard(state, payload.cardIndex, payload.chosenColor);
    const { state: s, actions } = runAiTurns(state);
    state = s;
    return makeResponse(state, actions.join("; "), null);
  }

  if (payload.type === "draw") {
    const { state: s, drawnCard } = drawCard(state);
    state = s;
    const drawnIndex = state.players[0].hand.length - 1;
    const top = topCard(state);
    const canPlay = getPlayableCards([drawnCard], top, state.currentColor).length > 0;
    if (!canPlay) {
      state = passTurn(state);
      const { state: s2, actions } = runAiTurns(state);
      state = s2;
      return makeResponse(state, actions.join("; "), null);
    }
    return makeResponse(state, "", drawnIndex);
  }

  if (payload.type === "pass") {
    state = passTurn(state);
    const { state: s, actions } = runAiTurns(state);
    state = s;
    return makeResponse(state, actions.join("; "), null);
  }

  return makeResponse(state, "", null);
}

function serveFile(res: http.ServerResponse, filePath: URL): void {
  const abs = path.normalize(fileURLToPath(filePath));
  if (!fs.existsSync(abs)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(abs);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(abs).pipe(res);
}

export function startServer(port: number): void {
  const server = http.createServer((req, res) => {
    const url = req.url ?? "/";

    if (req.method === "GET" && url === "/") {
      serveFile(res, new URL("index.html", PUBLIC_DIR));
      return;
    }

    if (req.method === "GET" && url.startsWith("/public/")) {
      const file = url.slice("/public/".length);
      serveFile(res, new URL(file, PUBLIC_DIR));
      return;
    }

    if (req.method === "POST" && url === "/action") {
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        try {
          const payload = JSON.parse(body) as ActionPayload;
          const response = handleAction(payload);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } catch {
          res.writeHead(400);
          res.end("Bad request");
        }
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(port, () => {
    console.log(`WoMiWo web UI running at http://localhost:${port}`);
  });
}
