// components/CardInput.tsx
"use client";

import { detectCardType } from "@/utils/cardType";
import { CardBrand } from "./CardBrand";
import { Input } from "./ui/Input";

interface CardInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

export function CardInput({ value, onChange, onBlur, error }: CardInputProps) {
  const cardType = detectCardType(value);

  return (
    <Input
      id="cardNumber"
      label="Card Number"
      type="text"
      inputMode="numeric"
      autoComplete="cc-number"
      placeholder="1234 5678 9012 3456"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
      rightSlot={
        cardType !== "unknown" ? <CardBrand cardType={cardType} /> : undefined
      }
    />
  );
}