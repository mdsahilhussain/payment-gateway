"use client";

import { useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { usePaymentStore } from "@/store/paymentStore";
import { formatAmount, formatTimestamp } from "@/utils/format";
import type { Transaction } from "@/types/payment";

const LIST_HEIGHT_PX = 400;

export function TransactionHistory() {
  const transactions = usePaymentStore((s) => s.transactions);
  const hasHydrated = usePaymentStore((s) => s.hasHydrated);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const toggle = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return (
    <section className="history-card" aria-label="Recent payments">
      <h3 className="history-title">
        Recent Payments
        <span className="history-count">({transactions.length})</span>
      </h3>

      <Virtuoso
        data={transactions}
        className="history-list"
        style={{ height: LIST_HEIGHT_PX }}
        // Stable per-item keys  keeps React reconciliation efficient and prevents incorrect state mapping when transactions update in place.
        computeItemKey={(_, txn) => txn.id}
        itemContent={(_, txn) => (
          <HistoryRow
            txn={txn}
            isOpen={selectedId === txn.id}
            onToggle={() => toggle(txn.id)}
          />
        )}
      />
    </section>
  );
}

interface HistoryRowProps {
  txn: Transaction;
  isOpen: boolean;
  onToggle: () => void;
}

function HistoryRow({ txn, isOpen, onToggle }: HistoryRowProps) {
  return (
    <div className="history-row">
      <button
        type="button"
        className="history-item"
        onClick={onToggle}
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
    </div>
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