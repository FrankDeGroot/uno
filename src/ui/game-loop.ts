import { initGame, playCard, drawCard, passTurn, getPlayableCards } from "../engine/index.js";
import { chooseCard } from "../ai/index.js";
import { cardDisplayName } from "../model/index.js";
import { renderGameState, renderComputerAction, renderGameOver } from "./renderer.js";
import { askChoice, askColor, close } from "./input.js";

export async function runGame(): Promise<void> {
  let state = initGame();

  while (state.winner === null) {
    const currentIndex = state.currentPlayerIndex;

    if (currentIndex === 0) {
      // Human turn
      console.log(renderGameState(state));

      const top = state.discardPile[state.discardPile.length - 1];
      const playable = getPlayableCards(state.players[0].hand, top, state.currentColor);

      let action: number;
      if (playable.length > 0) {
        action = await askChoice(
          `  Play a card [1-${state.players[0].hand.length}] or draw [0]: `,
          0,
          state.players[0].hand.length
        );
      } else {
        console.log("  No playable cards. Drawing...");
        action = 0;
      }

      if (action === 0) {
        // Draw
        const { state: newState, drawnCard } = drawCard(state);
        state = newState;
        console.log(`  You drew: ${cardDisplayName(drawnCard)}`);

        const topAfterDraw = state.discardPile[state.discardPile.length - 1];
        const canPlayDrawn = getPlayableCards([drawnCard], topAfterDraw, state.currentColor).length > 0;
        if (canPlayDrawn) {
          const drawnIndex = state.players[0].hand.length - 1;
          const choice = await askChoice("  Play the drawn card? [1=yes, 0=no]: ", 0, 1);
          if (choice === 1) {
            let chosenColor;
            if (drawnCard.kind === "wild") {
              chosenColor = await askColor();
            }
            state = playCard(state, drawnIndex, chosenColor);
          } else {
            state = passTurn(state);
          }
        } else {
          state = passTurn(state);
        }
      } else {
        // Play selected card
        const cardIndex = action - 1;
        if (!playable.includes(cardIndex)) {
          console.log("  That card cannot be played right now.");
          continue;
        }
        const card = state.players[0].hand[cardIndex];
        let chosenColor;
        if (card.kind === "wild") {
          chosenColor = await askColor();
        }
        state = playCard(state, cardIndex, chosenColor);
      }
    } else {
      // Computer turn
      const top = state.discardPile[state.discardPile.length - 1];
      const result = chooseCard(state.players[1].hand, top, state.currentColor);

      if (result === null) {
        const { state: newState, drawnCard } = drawCard(state);
        state = newState;
        console.log(renderComputerAction("drew a card."));

        // Computer plays drawn card if it can
        const topAfterDraw = state.discardPile[state.discardPile.length - 1];
        const drawnIndex = state.players[1].hand.length - 1;
        const canPlay = getPlayableCards([drawnCard], topAfterDraw, state.currentColor).length > 0;
        if (canPlay) {
          let chosenColor;
          if (drawnCard.kind === "wild") {
            const colors = ["red", "yellow", "green", "blue"] as const;
            chosenColor = colors[Math.floor(Math.random() * 4)];
          }
          state = playCard(state, drawnIndex, chosenColor);
          console.log(renderComputerAction(`played the drawn card: ${cardDisplayName(drawnCard)}.`));
        } else {
          state = passTurn(state);
        }
      } else {
        const card = state.players[1].hand[result.cardIndex];
        state = playCard(state, result.cardIndex, result.chosenColor);
        const desc = result.chosenColor
          ? `${cardDisplayName(card)} → chose ${result.chosenColor}`
          : cardDisplayName(card);
        console.log(renderComputerAction(`played ${desc}.`));
      }
    }
  }

  const winnerName = state.players[state.winner!].name;
  console.log(renderGameOver(winnerName));
  close();
}
