"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  FormErrors,
  FormField,
  FormTouched,
  FormValues,
} from "@/types/payment";
import { detectCardType } from "@/utils/cardType";
import { formatCardNumber } from "@/utils/format";
import { isFormValid, validateForm } from "@/utils/validation";

const INITIAL_VALUES: FormValues = {
  cardholderName: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

function sanitizeAmount(input: string): string {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length === 1) return cleaned;
  const intPart = parts[0];
  const decPart = parts.slice(1).join("").slice(0, 2);
  return `${intPart}.${decPart}`;
}

export function useCardForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<FormTouched>({});

  const errors: FormErrors = useMemo(() => validateForm(values), [values]);

  const isValid = useMemo(() => isFormValid(errors), [errors]);

  const visibleErrors: FormErrors = useMemo(() => {
    const result: FormErrors = {};
    (Object.keys(errors) as FormField[]).forEach((field) => {
      if (touched[field] && errors[field]) {
        result[field] = errors[field];
      }
    });
    return result;
  }, [errors, touched]);

  /**
   * Title: Generic field setter with per-field input transforms.
   * - cardNumber: auto-format with spaces; also trims CVV when card brand changes.
   * - cvv: digits only, capped at 4 (Amex max).
   * - cardholderName: collapse whitespace, cap length.
   * - amount: digits + at most one decimal point with 2 fractional digits.
   */
  const update = useCallback(
    <K extends FormField>(field: K, value: FormValues[K]): void => {
      setValues((prev) => {
        switch (field) {
          case "cardNumber": {
            const formatted = formatCardNumber(value as string);
            const newType = detectCardType(formatted);
            const maxCvv = newType === "amex" ? 4 : 3;
            return {
              ...prev,
              cardNumber: formatted,
              cvv: prev.cvv.slice(0, maxCvv),
            };
          }
          case "cvv":
            return {
              ...prev,
              cvv: (value as string).replace(/\D/g, "").slice(0, 4),
            };
          case "cardholderName":
            return {
              ...prev,
              cardholderName: (value as string)
                .replace(/\s+/g, " ")
                .slice(0, 50),
            };
          case "amount":
            return { ...prev, amount: sanitizeAmount(value as string) };
          default:
            return { ...prev, [field]: value };
        }
      });
    },
    []
  );

  const touch = useCallback((field: FormField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const touchAll = useCallback(() => {
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiryMonth: true,
      expiryYear: true,
      cvv: true,
      amount: true,
      currency: true,
    });
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setTouched({});
  }, []);

  return {
    values,
    errors,
    visibleErrors,
    touched,
    isValid,
    update,
    touch,
    touchAll,
    reset,
  };
}