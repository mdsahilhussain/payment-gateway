"use client";

import { useState, type SyntheticEvent } from "react";
import { CardPreview } from "./CardPreview";
import { CardInput } from "./CardInput";
import { useCardForm } from "@/hooks/useCardForm";
import { detectCardType } from "@/utils/cardType";
import { CURRENCIES, EXPIRY_YEAR_RANGE } from "@/utils/constants";
import type { Currency } from "@/types/payment";

export function PaymentForm() {
    const {
        values,
        visibleErrors,
        isValid,
        update,
        touch,
        touchAll,
    } = useCardForm();

    const [isCardFlipped, setIsCardFlipped] = useState(false);

    const cardType = detectCardType(values.cardNumber);
    const cvvMaxLength = cardType === "amex" ? 4 : 3;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const years = Array.from(
        { length: EXPIRY_YEAR_RANGE },
        (_, i) => currentYear + i
    );
    const minMonth =
        values.expiryYear === String(currentYear) ? currentMonth : 1;
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) {
            touchAll();
            return;
        }
        // TODO step 8 — kick off the payment via the usePayment hook.
        console.log("Submitting payment", values);
    };

    const blurExpiry = () => {
        touch("expiryMonth");
        touch("expiryYear");
    };

    return (
        <form
            className="payment-container"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Payment form"
        >
            <CardPreview
                cardNumber={values.cardNumber}
                cardholderName={values.cardholderName}
                expiryMonth={values.expiryMonth}
                expiryYear={values.expiryYear}
                cvv={values.cvv}
                isFlipped={isCardFlipped}
            />

            <div className="form-card">
                {/* Amount + Currency */}
                <div className="form-row">
                    <div className="form-col">
                        <div className="input-group">
                            <label htmlFor="amount" className="input-label">
                                Amount
                            </label>
                            <input
                                id="amount"
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className={`input ${visibleErrors.amount ? "input-error" : ""}`}
                                value={values.amount}
                                onChange={(e) => update("amount", e.target.value)}
                                onBlur={() => touch("amount")}
                                aria-invalid={!!visibleErrors.amount}
                                aria-describedby={
                                    visibleErrors.amount ? "amount-error" : undefined
                                }
                            />
                            {visibleErrors.amount && (
                                <p id="amount-error" className="error-message" role="alert">
                                    {visibleErrors.amount}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="form-col form-col-cvv">
                        <div className="input-group">
                            <label htmlFor="currency" className="input-label">
                                Currency
                            </label>
                            <select
                                id="currency"
                                className="select"
                                value={values.currency}
                                onChange={(e) =>
                                    update("currency", e.target.value as Currency)
                                }
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.symbol} {c.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Card Number */}
                <CardInput
                    value={values.cardNumber}
                    onChange={(v) => update("cardNumber", v)}
                    onBlur={() => touch("cardNumber")}
                    error={visibleErrors.cardNumber}
                />

                {/* Cardholder Name */}
                <div className="input-group">
                    <label htmlFor="cardholderName" className="input-label">
                        Cardholder Name
                    </label>
                    <input
                        id="cardholderName"
                        type="text"
                        autoComplete="cc-name"
                        className={`input ${visibleErrors.cardholderName ? "input-error" : ""
                            }`}
                        value={values.cardholderName}
                        onChange={(e) => update("cardholderName", e.target.value)}
                        onBlur={() => touch("cardholderName")}
                        aria-invalid={!!visibleErrors.cardholderName}
                        aria-describedby={
                            visibleErrors.cardholderName ? "cardholderName-error" : undefined
                        }
                    />
                    {visibleErrors.cardholderName && (
                        <p
                            id="cardholderName-error"
                            className="error-message"
                            role="alert"
                        >
                            {visibleErrors.cardholderName}
                        </p>
                    )}
                </div>

                {/* Expiry + CVV */}
                <div className="form-row">
                    <div className="form-col">
                        <div className="input-group">
                            <label htmlFor="expiryMonth" className="input-label">
                                Expiration Date
                            </label>
                            <div className="form-group">
                                <select
                                    id="expiryMonth"
                                    className={`select ${visibleErrors.expiryMonth ? "input-error" : ""
                                        }`}
                                    value={values.expiryMonth}
                                    onChange={(e) => update("expiryMonth", e.target.value)}
                                    onBlur={blurExpiry}
                                    aria-invalid={!!visibleErrors.expiryMonth}
                                    aria-describedby={
                                        visibleErrors.expiryMonth ? "expiry-error" : undefined
                                    }
                                >
                                    <option value="" disabled>
                                        Month
                                    </option>
                                    {months.map((m) => (
                                        <option
                                            key={m}
                                            value={String(m).padStart(2, "0")}
                                            disabled={m < minMonth}
                                        >
                                            {String(m).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    id="expiryYear"
                                    className={`select ${visibleErrors.expiryMonth ? "input-error" : ""
                                        }`}
                                    value={values.expiryYear}
                                    onChange={(e) => update("expiryYear", e.target.value)}
                                    onBlur={blurExpiry}
                                    aria-invalid={!!visibleErrors.expiryMonth}
                                    aria-describedby={
                                        visibleErrors.expiryMonth ? "expiry-error" : undefined
                                    }
                                >
                                    <option value="" disabled>
                                        Year
                                    </option>
                                    {years.map((y) => (
                                        <option key={y} value={String(y)}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {visibleErrors.expiryMonth && (
                                <p id="expiry-error" className="error-message" role="alert">
                                    {visibleErrors.expiryMonth}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="form-col form-col-cvv">
                        <div className="input-group">
                            <label htmlFor="cvv" className="input-label">
                                CVV
                            </label>
                            <input
                                id="cvv"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                maxLength={cvvMaxLength}
                                className={`input ${visibleErrors.cvv ? "input-error" : ""
                                    }`}
                                value={values.cvv}
                                onChange={(e) => update("cvv", e.target.value)}
                                onFocus={() => setIsCardFlipped(true)}
                                onBlur={() => {
                                    setIsCardFlipped(false);
                                    touch("cvv");
                                }}
                                aria-invalid={!!visibleErrors.cvv}
                                aria-describedby={
                                    visibleErrors.cvv ? "cvv-error" : undefined
                                }
                            />
                            {visibleErrors.cvv && (
                                <p id="cvv-error" className="error-message" role="alert">
                                    {visibleErrors.cvv}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={!isValid}>
                    Pay Now
                </button>
            </div>
        </form>
    );
}