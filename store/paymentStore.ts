"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Currency,
  PaymentPayload,
  PaymentStatus,
  Transaction,
} from "@/types/payment";
import { detectCardType } from "@/utils/cardType";
import { getCardLast4, stripCardNumber } from "@/utils/format";
import { MAX_RETRY_ATTEMPTS } from "@/utils/constants";

export interface BeginAttemptInput {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export type AttemptOutcome =
  | { status: "success"; approvalCode?: string }
  | { status: "failed"; reason: string }
  | { status: "timeout" };


interface PaymentState {
  status: PaymentStatus;
  currentTransactionId: string | null;
  currentPayload: PaymentPayload | null;
  attemptCount: number;
  failureReason: string | null;
  approvalCode: string | null;

  transactions: Transaction[];

  hasHydrated: boolean;

  beginAttempt: (input: BeginAttemptInput) => string;
  retry: () => string | null;
  completeAttempt: (outcome: AttemptOutcome) => void;
  resetFlow: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Store implementation using Zustand with persistence. The store manages both the

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      status: "idle",
      currentTransactionId: null,
      currentPayload: null,
      attemptCount: 0,
      failureReason: null,
      approvalCode: null,
      transactions: [],
      hasHydrated: false,

      /**
       Title: Start a new payment attempt. Generates a new transactionId and creates
       Description: A new record in history with "processing" status. The attemptCount is set to 1
       */
      beginAttempt: (input) => {
        const transactionId = crypto.randomUUID();
        const cardDigits = stripCardNumber(input.cardNumber);
        const cardType = detectCardType(cardDigits);
        const cardLast4 = getCardLast4(cardDigits);
        const trimmedName = input.cardholderName.trim();
        const now = Date.now();

        const payload: PaymentPayload = {
          transactionId,
          cardholderName: trimmedName,
          cardNumber: cardDigits,
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear,
          cvv: input.cvv,
          amount: input.amount,
          currency: input.currency,
        };

        const newRecord: Transaction = {
          id: transactionId,
          amount: input.amount,
          currency: input.currency,
          status: "processing",
          cardLast4,
          cardType,
          cardholderName: trimmedName,
          createdAt: now,
          updatedAt: now,
          attempts: 1,
        };

        set((state) => ({
          status: "processing",
          currentTransactionId: transactionId,
          currentPayload: payload,
          attemptCount: 1,
          failureReason: null,
          approvalCode: null,
          // Newest first
          transactions: [newRecord, ...state.transactions],
        }));

        return transactionId;
      },

      /**
       * Title: Retry the current attempt. Increments attemptCount and updates the existing history record.
       * Description: The transactionId remains the same to ensure history shows a single record with multiple attempts. If there's no current payload or attempts have been exhausted, it returns null.
       */
      retry: () => {
        const {
          currentTransactionId,
          currentPayload,
          attemptCount,
          transactions,
        } = get();

        if (
          !currentTransactionId ||
          !currentPayload ||
          attemptCount >= MAX_RETRY_ATTEMPTS
        ) {
          return null;
        }

        const nextAttempts = attemptCount + 1;
        const now = Date.now();

        set({
          status: "processing",
          attemptCount: nextAttempts,
          failureReason: null,
          approvalCode: null,
          transactions: transactions.map((t) =>
            t.id === currentTransactionId
              ? {
                  ...t,
                  status: "processing",
                  attempts: nextAttempts,
                  updatedAt: now,
                  failureReason: undefined,
                  approvalCode: undefined,
                }
              : t
          ),
        });

        return currentTransactionId;
      },

      /**
       * Title: Complete the in-flight attempt. Updates the transaction record with the final outcome (success, failure, or timeout).
       * Description: This function is atomic and updates both the live status (for UI) and the transaction history in one go. It also captures the failure reason or approval code as needed.
       */
      completeAttempt: (outcome) => {
        const { currentTransactionId, transactions } = get();
        if (!currentTransactionId) return;

        const now = Date.now();
        const reason =
          outcome.status === "failed" ? outcome.reason : undefined;
        const approval =
          outcome.status === "success" ? outcome.approvalCode : undefined;

        set({
          status: outcome.status,
          failureReason: reason ?? null,
          approvalCode: approval ?? null,
          transactions: transactions.map((t) =>
            t.id === currentTransactionId
              ? {
                  ...t,
                  status: outcome.status,
                  failureReason: reason,
                  approvalCode: approval,
                  updatedAt: now,
                }
              : t
          ),
        });
      },

      resetFlow: () => {
        set({
          status: "idle",
          currentTransactionId: null,
          currentPayload: null,
          attemptCount: 0,
          failureReason: null,
          approvalCode: null,
        });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "payment-history-v1",
      storage: createJSONStorage(() => localStorage),
      // Title: Partialize function to control what gets persisted. We only want to persist the transaction history and not the sensitive current payload.
      partialize: (state) => ({ transactions: state.transactions }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration completes (or fails).
        state?.setHasHydrated(true);
      },
    }
  )
);

/* 
 * Selectors — composable helpers for components.
 * Use as: `usePaymentStore(selectCanRetry)`
 *  */

export const selectCanRetry = (s: PaymentState): boolean =>
  (s.status === "failed" || s.status === "timeout") &&
  s.attemptCount < MAX_RETRY_ATTEMPTS &&
  s.currentPayload !== null;

export const selectAttemptsExhausted = (s: PaymentState): boolean =>
  (s.status === "failed" || s.status === "timeout") &&
  s.attemptCount >= MAX_RETRY_ATTEMPTS;

export const selectCurrentTransaction = (
  s: PaymentState
): Transaction | null => {
  if (!s.currentTransactionId) return null;
  return s.transactions.find((t) => t.id === s.currentTransactionId) ?? null;
};