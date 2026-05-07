"use client";

import { useCallback } from "react";
import {
  usePaymentStore,
  type BeginAttemptInput,
} from "@/store/paymentStore";
import {
  PROCESSING_MIN_MS,
  REQUEST_TIMEOUT_MS,
} from "@/utils/constants";
import type { PaymentApiResponse } from "@/types/payment";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

async function sendRequest(): Promise<void> {
  const { currentPayload, completeAttempt } = usePaymentStore.getState();

  if (!currentPayload) {
    // Defensive: store would normally have a payload after begin/retry.
    completeAttempt({
      status: "failed",
      reason: "Missing payment details",
    });
    return;
  }

  const controller = new AbortController();

  // Frontend timeout  fires before the server's 8s stall on timeout outcomes.
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  // Visual minimum so the user always sees ~2s of "Processing", even if the gateway responds in 50ms. Avoids jarring flash-of-result.
  const minProcessing = delay(PROCESSING_MIN_MS);

  try {
    const fetchPromise = fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentPayload),
      signal: controller.signal,
    });

    const [response] = await Promise.all([fetchPromise, minProcessing]);
    clearTimeout(timeoutId);

    if (!response.ok) {
      completeAttempt({
        status: "failed",
        reason: `Gateway error (${response.status})`,
      });
      return;
    }

    const data = (await response.json()) as PaymentApiResponse;
    if (data.status === "success") {
      completeAttempt({
        status: "success",
        approvalCode: data.approvalCode,
      });
    } else {
      completeAttempt({
        status: "failed",
        reason: data.reason ?? "Payment declined",
      });
    }
  } catch (err) {
    clearTimeout(timeoutId);
    // Honor the visual minimum even on the failure paths so the UI never
    // flashes from Idle → Result faster than 2s.
    await minProcessing;

    if (isAbortError(err)) {
      // Our 6s timeout fired before the server responded → Timeout state.
      completeAttempt({ status: "timeout" });
    } else {
      // Genuine network error: offline, DNS failure, CORS, etc.
      // Distinct user-facing message from gateway-returned failures.
      completeAttempt({
        status: "failed",
        reason: "Network error  please check your connection",
      });
    }
  }
}

interface UsePaymentReturn {
  submit: (input: BeginAttemptInput) => Promise<void>;
  retry: () => Promise<void>;
}

export function usePayment(): UsePaymentReturn {
  const submit = useCallback(
    async (input: BeginAttemptInput): Promise<void> => {
      const { status, beginAttempt } = usePaymentStore.getState();
      // Defense-in-depth: UI also disables submit while processing.
      if (status === "processing") return;
      beginAttempt(input);
      await sendRequest();
    },
    []
  );

  const retry = useCallback(async (): Promise<void> => {
    const { status, retry: retryAction } = usePaymentStore.getState();
    if (status === "processing") return;
    const transactionId = retryAction();
    if (!transactionId) return; // retries exhausted or no current payment
    await sendRequest();
  }, []);

  return { submit, retry };
}