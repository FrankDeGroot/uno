import type { GameState, Card, Color } from "../model/index.js";
import { cardDisplayName } from "../model/index.js";

const ANSI: Record<Color, string> = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function colorize(text: string, color: Color): string {
  return `${ANSI[color]}${text}${RESET}`;
}

function colorizedCard(card: Card, currentColor: Color): string {
  const name = cardDisplayName(card);
  const color = card.kind === "wild" ? currentColor : card.color;
  return colorize(name, color);
}

export function renderGameState(state: GameState): string {
  const top = state.discardPile[state.discardPile.length - 1];
  const computer = state.players[1];
  const player = state.players[0];

  const lines: string[] = [
    "",
    `${BOLD}─────────────────────────────────${RESET}`,
    `Top card:  ${colorizedCard(top, state.currentColor)}  (active color: ${colorize(state.currentColor, state.currentColor)})`,
    `Computer:  ${computer.hand.length} card${computer.hand.length !== 1 ? "s" : ""}`,
    `${BOLD}─────────────────────────────────${RESET}`,
    `${BOLD}Your hand:${RESET}`,
    ...player.hand.map((card, i) => `  [${i + 1}] ${colorizedCard(card, state.currentColor)}`),
    "",
  ];

  return lines.join("\n");
}

export function renderComputerAction(action: string): string {
  return `\n  Computer: ${action}\n`;
}

export function renderGameOver(winnerName: string): string {
  return `\n${BOLD}Game over! ${winnerName} wins!${RESET}\n`;
}
