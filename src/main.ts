import { runGame } from "./ui/game-loop.js";

process.on("SIGINT", () => {
  console.log("\nGoodbye!");
  process.exit(0);
});

runGame().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
