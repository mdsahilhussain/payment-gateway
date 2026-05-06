"use client";

import { detectCardType } from "@/utils/cardType";
import { CardBrand } from "./CardBrand";
import { cn } from "@/utils";

interface CardInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    error?: string;
}

export function CardInput({ value, onChange, onBlur, error }: CardInputProps) {
    const cardType = detectCardType(value);
    const errorId = "cardNumber-error";

    return (
        <div className="input-group">
            <label htmlFor="cardNumber" className="input-label">
                Card Number
            </label>
            <div className="card-input-wrap">
                <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    className={cn("input card-input-field", error && "input-error")}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                />
                {cardType !== "unknown" && (
                    <div className="card-input-brand" aria-hidden>
                        <CardBrand cardType={cardType} />
                    </div>
                )}
            </div>
            {error && (
                <p id={errorId} className="error-message" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}