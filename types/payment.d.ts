export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type Currency = "INR" | "USD";

export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

/** 
 Payload sent to /api/pay on every attempt. transactionId is generated once on the frontend (crypto.randomUUID) and reused for retries to keep history idempotent.
 */
export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

/**
 Response shape from the mock gateway."timeout" is detected on the frontend via AbortController,  not returned by the server.
 */
export interface PaymentApiResponse {
  status: "success" | "failed";
  transactionId: string;
  reason?: string; // e.g. "Insufficient funds"
  approvalCode?: string; // present on success
}

/**
 Persisted transaction record. One entry per transactionId retries update the same record.
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  cardLast4: string;
  cardType: CardType;
  cardholderName: string;
  createdAt: number; // unix ms
  updatedAt: number; // unix ms
  attempts: number; // 1–3
  failureReason?: string;
  approvalCode?: string;
}

/**
 Form-level types  kept separate from PaymentPayload because the form holds strings (e.g. amount as text) before normalisation.
 */
export interface FormValues {
  cardholderName: string;
  cardNumber: string; // formatted for display ("4242 4242 ...")
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export type FormField = keyof FormValues;

export type FormErrors = Partial<Record<FormField, string>>;
export type FormTouched = Partial<Record<FormField, boolean>>;