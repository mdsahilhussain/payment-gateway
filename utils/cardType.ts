import type { CardType } from "@/types/payment";

interface CardConfig {
  length: number;
  cvvLength: number;
  blocks: readonly number[];
}

const CARD_CONFIG: Record<Exclude<CardType, "unknown">, CardConfig> = {
  visa: { length: 16, cvvLength: 3, blocks: [4, 4, 4, 4] },
  mastercard: { length: 16, cvvLength: 3, blocks: [4, 4, 4, 4] },
  amex: { length: 15, cvvLength: 4, blocks: [4, 6, 5] },
};

const UNKNOWN_CONFIG: CardConfig = {
  length: 19,
  cvvLength: 3,
  blocks: [4, 4, 4, 4, 3],
};

const PATTERNS: ReadonlyArray<{
  type: Exclude<CardType, "unknown">;
  regex: RegExp;
}> = [
  { type: "amex", regex: /^3[47]/ },
  { type: "visa", regex: /^4/ },
  { type: "mastercard", regex: /^5[1-5]/ },
];

export function detectCardType(value: string): CardType {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "unknown";
  for (const { type, regex } of PATTERNS) {
    if (regex.test(digits)) return type;
  }
  return "unknown";
}

export function getCardConfig(type: CardType): CardConfig {
  return type === "unknown" ? UNKNOWN_CONFIG : CARD_CONFIG[type];
}
