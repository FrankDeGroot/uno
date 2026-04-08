import * as readline from "node:readline";
import type { Color } from "../model/index.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function askQuestion(prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

export async function askChoice(prompt: string, min: number, max: number): Promise<number> {
  while (true) {
    const answer = await askQuestion(prompt);
    const n = parseInt(answer.trim(), 10);
    if (!isNaN(n) && n >= min && n <= max) return n;
    console.log(`  Please enter a number between ${min} and ${max}.`);
  }
}

export async function askColor(): Promise<Color> {
  const colors: Color[] = ["red", "yellow", "green", "blue"];
  console.log("\n  Choose a color:");
  colors.forEach((c, i) => console.log(`    [${i + 1}] ${c}`));
  const n = await askChoice("  Your choice: ", 1, 4);
  return colors[n - 1];
}

export function close(): void {
  rl.close();
}
