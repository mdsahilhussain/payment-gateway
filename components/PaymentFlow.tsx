// components/PaymentFlow.tsx
"use client";

import { usePaymentStore } from "@/store/paymentStore";
import { PaymentForm } from "./PaymentForm";
import { StatusScreen } from "./StatusScreen";
import { TransactionHistory } from "./TransactionHistory";

export function PaymentFlow() {
  const status = usePaymentStore((s) => s.status);

  return (
    <div className="payment-container">
      {status === "idle" ? <PaymentForm /> : <StatusScreen />}
      <TransactionHistory />
    </div>
  );
}