import { NextResponse } from "next/server";
import type { PaymentApiResponse } from "@/types/payment";
import {
  FAILURE_REASONS,
  GATEWAY_OUTCOMES,
  SERVER_TIMEOUT_DELAY_MS,
} from "@/utils/constants";

type Outcome = "success" | "failed" | "timeout";

function pickOutcome(): Outcome {
  const r = Math.random();
  if (r < GATEWAY_OUTCOMES.SUCCESS) return "success";
  if (r < GATEWAY_OUTCOMES.SUCCESS + GATEWAY_OUTCOMES.FAILURE) return "failed";
  return "timeout";
}

function pickFailureReason(): string {
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
}

function generateApprovalCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Title: Type guard for incoming body. The mock gateway only requires `transactionId`
 * — everything else is echoed without validation, which is fine because the
 * frontend has already validated. A real gateway would validate every field.
 */
function isValidBody(body: unknown): body is { transactionId: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "transactionId" in body &&
    typeof (body as { transactionId: unknown }).transactionId === "string"
  );
}

/* POST /api/pay */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "transactionId is required" },
      { status: 400 }
    );
  }

  const { transactionId } = body;
  const outcome = pickOutcome();

  if (outcome === "timeout") {
    await delay(SERVER_TIMEOUT_DELAY_MS);
    return NextResponse.json<PaymentApiResponse>(
      { status: "failed", transactionId, reason: "Gateway timeout" },
      { status: 200 }
    );
  }

  if (outcome === "failed") {
    return NextResponse.json<PaymentApiResponse>(
      { status: "failed", transactionId, reason: pickFailureReason() },
      { status: 200 }
    );
  }

  return NextResponse.json<PaymentApiResponse>(
    { status: "success", transactionId, approvalCode: generateApprovalCode() },
    { status: 200 }
  );
}