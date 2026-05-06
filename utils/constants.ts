import type { Currency } from "@/types/payment";

export const MAX_RETRY_ATTEMPTS = 3;

export const REQUEST_TIMEOUT_MS = 6_000;

export const PROCESSING_MIN_MS = 2_000;

export const SERVER_TIMEOUT_DELAY_MS = 8_000;

export const GATEWAY_OUTCOMES = {
  SUCCESS: 0.6,
  FAILURE: 0.25,
  TIMEOUT: 0.15,
} as const;

export const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined by issuer",
  "Suspected fraud — contact your bank",
  "Authentication failed",
  "Gateway error",
] as const;

export const CURRENCIES: ReadonlyArray<{
  code: Currency;
  symbol: string;
  label: string;
}> = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
];

export const EXPIRY_YEAR_RANGE = 12;