import { Currency } from "@/types/payment";
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

/** Last 4 digits for transaction history display. */
export function getCardLast4(cardNumber: string): string {
  return stripCardNumber(cardNumber).slice(-4);
}

/** Locale per currency keeps the symbol/format consistent. */
const CURRENCY_LOCALE: Record<Currency, string> = {
  INR: "en-IN",
  USD: "en-US",
};

/** Format a numeric amount as localised currency (e.g. ₹1,234.50, $1,234.50). */
export function formatAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Human-readable timestamp for transaction history. */
export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

/** "MM/YY" for the card preview's expiry slot. */
export function formatExpiryShort(month: string, year: string): string {
  if (!month || !year) return "";
  return `${month}/${year.slice(-2)}`;
}