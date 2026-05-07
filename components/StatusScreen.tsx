"use client";

import { useEffect, useRef } from "react";
import { usePayment } from "@/hooks/usePayment";
import {
  selectAttemptsExhausted,
  selectCanRetry,
  selectCurrentTransaction,
  usePaymentStore,
} from "@/store/paymentStore";
import { formatAmount } from "@/utils/format";
import { MAX_RETRY_ATTEMPTS } from "@/utils/constants";
import { Button } from "./ui/Button";

export function StatusScreen() {
  const status = usePaymentStore((s) => s.status);
  const attemptCount = usePaymentStore((s) => s.attemptCount);
  const failureReason = usePaymentStore((s) => s.failureReason);
  const approvalCode = usePaymentStore((s) => s.approvalCode);
  const transaction = usePaymentStore(selectCurrentTransaction);
  const canRetry = usePaymentStore(selectCanRetry);
  const exhausted = usePaymentStore(selectAttemptsExhausted);
  const resetFlow = usePaymentStore((s) => s.resetFlow);
  const { retry } = usePayment();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "idle") containerRef.current?.focus();
  }, [status]);

  if (status === "idle") return null;

  const isProcessing = status === "processing";
  const ariaRole = isProcessing ? "status" : "alert";
  const ariaLive = isProcessing ? "polite" : "assertive";

  return (
    <div
      ref={containerRef}
      className="status-screen"
      tabIndex={-1}
      role={ariaRole}
      aria-live={ariaLive}
    >
      {status === "processing" && (
        <>
          <div className="status-spinner" aria-hidden />
          <h2 className="status-title">Processing payment…</h2>
          <p className="status-message">Please don&apos;t close this window.</p>
          {transaction && (
            <p className="status-amount">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          )}
          {attemptCount > 1 && (
            <span className="status-attempt">
              Attempt {attemptCount} of {MAX_RETRY_ATTEMPTS}
            </span>
          )}
        </>
      )}

      {status === "success" && (
        <>
          <div className="status-icon status-icon-success" aria-hidden>
            <CheckIcon />
          </div>
          <h2 className="status-title">Payment Successful</h2>
          {transaction && (
            <p className="status-amount">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          )}
          {approvalCode && (
            <p className="status-meta">
              Approval code: <strong>{approvalCode}</strong>
            </p>
          )}
          {transaction && (
            <p className="status-meta">
              Card ending in •••• {transaction.cardLast4}
            </p>
          )}
          <div className="status-actions">
            <Button variant="primary" onClick={resetFlow}>
              Make another payment
            </Button>
          </div>
        </>
      )}

      {(status === "failed" || status === "timeout") && (
        <>
          <div
            className={`status-icon ${
              status === "timeout" ? "status-icon-warning" : "status-icon-error"
            }`}
            aria-hidden
          >
            {status === "timeout" ? <ClockIcon /> : <CrossIcon />}
          </div>
          <h2 className="status-title">
            {status === "timeout" ? "Request Timed Out" : "Payment Failed"}
          </h2>
          <p className="status-message">
            {status === "timeout"
              ? "The gateway took too long to respond."
              : failureReason ?? "Something went wrong."}
          </p>
          <span className="status-attempt">
            Attempt {attemptCount} of {MAX_RETRY_ATTEMPTS}
          </span>
          <div className="status-actions">
            {canRetry && (
              <Button variant="primary" onClick={() => retry()}>
                Try again
              </Button>
            )}
            {exhausted && (
              <p className="status-final" role="alert">
                Maximum retry attempts reached. Please start a new payment.
              </p>
            )}
            <Button variant="secondary" onClick={resetFlow}>
              Start new payment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/*  Inline icons  */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}