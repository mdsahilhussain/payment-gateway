"use client";

import { useState, type SyntheticEvent } from "react";
import { CardPreview } from "./CardPreview";
import { CardInput } from "./CardInput";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useCardForm } from "@/hooks/useCardForm";
import { usePayment } from "@/hooks/usePayment";
import { detectCardType } from "@/utils/cardType";
import { CURRENCIES, EXPIRY_YEAR_RANGE } from "@/utils/constants";
import { usePaymentStore } from "@/store/paymentStore";
import type { Currency } from "@/types/payment";

export function PaymentForm() {
  const { values, visibleErrors, isValid, update, touch, touchAll } =
    useCardForm();
  const { submit } = usePayment();
  const status = usePaymentStore((s) => s.status);

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

  const isSubmitting = status === "processing";

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) {
      touchAll();
      return;
    }
    await submit({
      cardholderName: values.cardholderName,
      cardNumber: values.cardNumber,
      expiryMonth: values.expiryMonth,
      expiryYear: values.expiryYear,
      cvv: values.cvv,
      amount: parseFloat(values.amount),
      currency: values.currency,
    });
  };

  const blurExpiry = () => {
    touch("expiryMonth");
    touch("expiryYear");
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Payment form">
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
            <Input
              id="amount"
              label="Amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => update("amount", e.target.value)}
              onBlur={() => touch("amount")}
              error={visibleErrors.amount}
            />
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
        <Input
          id="cardholderName"
          label="Cardholder Name"
          type="text"
          autoComplete="cc-name"
          value={values.cardholderName}
          onChange={(e) => update("cardholderName", e.target.value)}
          onBlur={() => touch("cardholderName")}
          error={visibleErrors.cardholderName}
        />

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
                  className={`select ${
                    visibleErrors.expiryMonth ? "input-error" : ""
                  }`}
                  value={values.expiryMonth}
                  onChange={(e) => update("expiryMonth", e.target.value)}
                  onBlur={blurExpiry}
                  aria-invalid={visibleErrors.expiryMonth ? true : undefined}
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
                  className={`select ${
                    visibleErrors.expiryMonth ? "input-error" : ""
                  }`}
                  value={values.expiryYear}
                  onChange={(e) => update("expiryYear", e.target.value)}
                  onBlur={blurExpiry}
                  aria-invalid={visibleErrors.expiryMonth ? true : undefined}
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
            <Input
              id="cvv"
              label="CVV"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={cvvMaxLength}
              value={values.cvv}
              onChange={(e) => update("cvv", e.target.value)}
              onFocus={() => setIsCardFlipped(true)}
              onBlur={() => {
                setIsCardFlipped(false);
                touch("cvv");
              }}
              error={visibleErrors.cvv}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!isValid}
          loading={isSubmitting}
          loadingText="Processing…"
        >
          Pay Now
        </Button>
      </div>
    </form>
  );
}