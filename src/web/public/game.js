let currentState = null;
let currentPlayable = [];
let pendingWildIndex = null;
let hasDrawn = false;

async function sendAction(payload) {
  const res = await fetch("/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  currentState = data.state;
  currentPlayable = data.playableIndices;
  render(data);
}

function cardClass(card, currentColor) {
  if (card.kind === "wild") return "card card-wild";
  return `card card-${card.color}`;
}

function cardLabel(card) {
  if (card.kind === "number") return `${capitalize(card.color)}<br>${card.value}`;
  if (card.kind === "action") {
    const label = card.action === "draw-two" ? "Draw Two"
      : card.action === "skip" ? "Skip" : "Reverse";
    return `${capitalize(card.color)}<br>${label}`;
  }
  return card.wildType === "wild-draw-four" ? "Wild<br>Draw Four" : "Wild";
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function topCardClass(card, currentColor) {
  if (card.kind === "wild") return `card card-${currentColor}`;
  return `card card-${card.color}`;
}

function render({ state, playableIndices, lastComputerAction, drawnCardIndex }) {
  hasDrawn = drawnCardIndex !== null;

  // Top card
  const top = state.discardPile[state.discardPile.length - 1];
  const topEl = document.getElementById("top-card");
  topEl.className = topCardClass(top, state.currentColor);
  topEl.innerHTML = cardLabel(top);

  // Active color
  const colorDot = document.getElementById("active-color-dot");
  colorDot.className = `color-dot ${state.currentColor}`;
  document.getElementById("active-color").textContent = state.currentColor;

  // Computer count
  document.getElementById("computer-count").textContent = state.players[1].hand.length;

  // Message
  const msgEl = document.getElementById("message");
  if (state.winner !== null) {
    const winner = state.players[state.winner].name;
    msgEl.textContent = `${winner} wins! 🎉`;
    msgEl.className = "gameover";
  } else if (lastComputerAction) {
    msgEl.textContent = `Computer: ${lastComputerAction}`;
    msgEl.className = "";
  } else if (drawnCardIndex !== null) {
    const drawn = state.players[0].hand[drawnCardIndex];
    msgEl.textContent = `You drew: ${drawn.kind === "number" ? `${drawn.color} ${drawn.value}` : drawn.kind === "action" ? `${drawn.color} ${drawn.action}` : drawn.wildType}`;
    msgEl.className = "";
  } else {
    msgEl.textContent = "";
    msgEl.className = "";
  }

  // Hand
  const handEl = document.getElementById("hand");
  handEl.innerHTML = "";
  state.players[0].hand.forEach((card, i) => {
    const btn = document.createElement("button");
    btn.className = cardClass(card, state.currentColor);
    btn.innerHTML = cardLabel(card);
    const isPlayable = playableIndices.includes(i);
    const isDrawnHighlight = i === drawnCardIndex;

    btn.disabled = !isPlayable || state.winner !== null || pendingWildIndex !== null;

    if (isDrawnHighlight && isPlayable) {
      btn.style.outline = "3px solid white";
    }

    btn.onclick = () => onPlayCard(i, card);
    handEl.appendChild(btn);
  });

  // Draw button
  const drawBtn = document.getElementById("draw-btn");
  drawBtn.disabled = hasDrawn || state.winner !== null || pendingWildIndex !== null;

  // Pass button
  const passBtn = document.getElementById("pass-btn");
  if (hasDrawn) {
    passBtn.style.display = "inline-block";
  } else {
    passBtn.style.display = "none";
  }

  // Color picker
  const pickerEl = document.getElementById("color-picker");
  pickerEl.style.display = pendingWildIndex !== null ? "block" : "none";
}

function onPlayCard(index, card) {
  if (card.kind === "wild") {
    pendingWildIndex = index;
    render({ state: currentState, playableIndices: currentPlayable, lastComputerAction: "", drawnCardIndex: hasDrawn ? currentState.players[0].hand.length - 1 : null });
    return;
  }
  hasDrawn = false;
  pendingWildIndex = null;
  sendAction({ type: "play", cardIndex: index });
}

function onColorChosen(color) {
  const idx = pendingWildIndex;
  pendingWildIndex = null;
  hasDrawn = false;
  sendAction({ type: "play", cardIndex: idx, chosenColor: color });
}

function onDraw() {
  sendAction({ type: "draw" });
}

function onPass() {
  hasDrawn = false;
  sendAction({ type: "pass" });
}

function onNewGame() {
  pendingWildIndex = null;
  hasDrawn = false;
  sendAction({ type: "new-game" });
}

// Start a game on load
sendAction({ type: "new-game" });
