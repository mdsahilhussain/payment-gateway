import type { CardType, FormErrors, FormValues } from "@/types/payment";
import { detectCardType, getCardConfig } from "./cardType";
import { stripCardNumber } from "./format";

const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s.'-]*$/;

export function validateCardholderName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Cardholder name is required";
  if (trimmed.length < 2) return "Name is too short";
  if (trimmed.length > 50) return "Name is too long";
  if (!NAME_REGEX.test(trimmed)) return "Use letters only";
  return undefined;
}

export function validateCardNumber(value: string): string | undefined {
  const digits = stripCardNumber(value);
  if (!digits) return "Card number is required";

  const type = detectCardType(digits);
  if (type === "unknown") return "Unsupported card type";

  const { length } = getCardConfig(type);
  if (digits.length < length) return `Must be ${length} digits`;
  if (!luhnCheck(digits)) return "Card number is invalid";
  return undefined;
}

export function validateExpiry(
  month: string,
  year: string
): string | undefined {
  if (!month) return "Select expiry month";
  if (!year) return "Select expiry year";

  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || m < 1 || m > 12) return "Invalid month";
  if (!Number.isInteger(y)) return "Invalid year";

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (y < currentYear) return "Card has expired";
  if (y === currentYear && m < currentMonth) return "Card has expired";
  return undefined;
}

export function validateCvv(
  value: string,
  cardType: CardType
): string | undefined {
  if (!value) return "CVV is required";
  if (!/^\d+$/.test(value)) return "Digits only";
  const expected = cardType === "amex" ? 4 : 3;
  if (value.length !== expected) return `Must be ${expected} digits`;
  return undefined;
}

export function validateAmount(value: string): string | undefined {
  if (!value.trim()) return "Amount is required";
  const num = Number(value);
  if (!Number.isFinite(num)) return "Enter a valid amount";
  if (num <= 0) return "Amount must be greater than 0";
  if (num > 10_000_000) return "Amount is too large";
  return undefined;
}

export function validateForm(values: FormValues): FormErrors {
  const cardType = detectCardType(values.cardNumber);
  return {
    cardholderName: validateCardholderName(values.cardholderName),
    cardNumber: validateCardNumber(values.cardNumber),
    expiryMonth: validateExpiry(values.expiryMonth, values.expiryYear),
    cvv: validateCvv(values.cvv, cardType),
    amount: validateAmount(values.amount),
  };
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.values(errors).every((err) => !err);
}

/*
 * Title: Luhn algorithm implementation.
 * Luhn algorithm checksum validation for card numbers. Not strictly required by the spec, but every real card number passes Luhn,
 * so failing it catches typos cheaply. Stripe/test cards (4242…) all pass.
 */
function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}
