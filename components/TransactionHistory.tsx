"use client";

import { useState } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { formatAmount, formatTimestamp } from "@/utils/format";
import type { Transaction } from "@/types/payment";

export function TransactionHistory() {
  const transactions = usePaymentStore((s) => s.transactions);
  const hasHydrated = usePaymentStore((s) => s.hasHydrated);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Avoid hydration mismatch: don't render real data until rehydrated.
  if (!hasHydrated) {
    return (
      <section className="history-card" aria-label="Recent payments">
        <h3 className="history-title">Recent Payments</h3>
        <p className="history-empty">Loading…</p>
      </section>
    );
  }

  if (transactions.length === 0) {
    return (
      <section className="history-card" aria-label="Recent payments">
        <h3 className="history-title">Recent Payments</h3>
        <p className="history-empty">No payments yet.</p>
      </section>
    );
  }

  return (
    <section className="history-card" aria-label="Recent payments">
      <h3 className="history-title">Recent Payments</h3>
      <ul className="history-list">
        {transactions.map((txn) => {
          const isOpen = selectedId === txn.id;
          return (
            <li key={txn.id}>
              <button
                type="button"
                className="history-item"
                onClick={() => setSelectedId(isOpen ? null : txn.id)}
                aria-expanded={isOpen}
                aria-controls={`txn-details-${txn.id}`}
              >
                <div className="history-item-main">
                  <span
                    className={`history-status-badge history-status-${txn.status}`}
                  >
                    {txn.status}
                  </span>
                  <span className="history-amount">
                    {formatAmount(txn.amount, txn.currency)}
                  </span>
                </div>
                <div className="history-item-meta">
                  <span className="history-card-info">
                    {txn.cardType} ••••{txn.cardLast4}
                  </span>
                  <span>{formatTimestamp(txn.createdAt)}</span>
                </div>
              </button>
              {isOpen && (
                <div id={`txn-details-${txn.id}`}>
                  <TransactionDetails txn={txn} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TransactionDetails({ txn }: { txn: Transaction }) {
  return (
    <dl className="history-details">
      <dt>Transaction ID</dt>
      <dd className="history-id">{txn.id}</dd>

      <dt>Cardholder</dt>
      <dd>{txn.cardholderName}</dd>

      <dt>Card</dt>
      <dd>
        {txn.cardType.toUpperCase()} •••• {txn.cardLast4}
      </dd>

      <dt>Amount</dt>
      <dd>{formatAmount(txn.amount, txn.currency)}</dd>

      <dt>Status</dt>
      <dd>{txn.status}</dd>

      {txn.failureReason && (
        <>
          <dt>Reason</dt>
          <dd>{txn.failureReason}</dd>
        </>
      )}

      {txn.approvalCode && (
        <>
          <dt>Approval</dt>
          <dd>{txn.approvalCode}</dd>
        </>
      )}

      <dt>Attempts</dt>
      <dd>{txn.attempts}</dd>

      <dt>Created</dt>
      <dd>{formatTimestamp(txn.createdAt)}</dd>

      <dt>Updated</dt>
      <dd>{formatTimestamp(txn.updatedAt)}</dd>
    </dl>
  );
}