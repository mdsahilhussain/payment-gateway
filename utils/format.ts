import { detectCardType, getCardConfig } from "./cardType";

export function stripCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Title: Format a card number with brand-aware spacing.
 * Description: As users type, formats the card number with spaces according to the detected brand's typical grouping:
 *  - Visa/MC:  "4242 4242 4242 4242"
 *  - Amex:     "3782 822463 10005"
 * Caps length at the brand's max so users can't type past 16/15 digits.
 */
export function formatCardNumber(rawValue: string): string {
  const digits = stripCardNumber(rawValue);
  const type = detectCardType(digits);
  const { length, blocks } = getCardConfig(type);
  const truncated = digits.slice(0, length);

  const groups: string[] = [];
  let cursor = 0;
  for (const blockSize of blocks) {
    if (cursor >= truncated.length) break;
    groups.push(truncated.slice(cursor, cursor + blockSize));
    cursor += blockSize;
  }
  return groups.join(" ");
}