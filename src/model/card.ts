export type Color = "red" | "yellow" | "green" | "blue";
export type NumberValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ActionType = "skip" | "reverse" | "draw-two";
export type WildType = "wild" | "wild-draw-four";

export interface NumberCard {
  kind: "number";
  color: Color;
  value: NumberValue;
}

export interface ActionCard {
  kind: "action";
  color: Color;
  action: ActionType;
}

export interface WildCard {
  kind: "wild";
  wildType: WildType;
  chosenColor?: Color;
}

export type Card = NumberCard | ActionCard | WildCard;

export function cardDisplayName(card: Card): string {
  if (card.kind === "number") {
    return `${card.color} ${card.value}`;
  } else if (card.kind === "action") {
    const label = card.action === "draw-two" ? "Draw Two"
      : card.action === "skip" ? "Skip"
      : "Reverse";
    return `${card.color} ${label}`;
  } else {
    const label = card.wildType === "wild-draw-four" ? "Wild Draw Four" : "Wild";
    return card.chosenColor ? `${label} (${card.chosenColor})` : label;
  }
}
