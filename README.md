# Payment Gateway

A simulated payment gateway UI built for the mid-level frontend assignment. No third-party payment SDKs (Stripe, Razorpay, etc.) — gateway behaviour is mocked via a Next.js Route Handler that randomises outcomes between success, failure, and timeout. The full payment lifecycle, including retries with idempotency and a 6-second client-side timeout, lives entirely on the frontend.

## Tech Stack

- **Next.js (App Router)** with **TypeScript** — `any` is not used anywhere
- **Tailwind CSS v4** with `@layer components` + `@apply` for semantic class names; inline utilities are minimised in JSX
- **Zustand** with `persist` middleware for global state (lifecycle + history). Form-field values stay local in `useState`
- **react-virtuoso** for virtualised transaction history (constant DOM cost regardless of list size)

No third-party form, validation, or HTTP libraries — those are hand-rolled to keep the dependency surface small and to demonstrate the underlying concepts.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Requires Node.js 18.18 or later.

### Other scripts

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

## Test Cards

Cards that pass Luhn validation:

| Brand      | Number                | CVV              | Notes                      |
| ---------- | --------------------- | ---------------- | -------------------------- |
| Visa       | `4242 4242 4242 4242` | any 3 digits     | most common test card      |
| Mastercard | `5555 5555 5555 4444` | any 3 digits     |                            |
| Amex       | `3782 822463 10005`   | any **4** digits | 15-digit, 4-6-5 grouping   |

Any future expiry works. The mock gateway randomises the outcome regardless of the card data submitted.

## Project Structure

```
app/
  api/pay/route.ts         # mock gateway with 60/25/15 outcome split
  globals.css              # design tokens + @layer components
  layout.tsx               # next/font wiring
  page.tsx                 # entry point — renders <PaymentFlow />
components/
  ui/
    Button.tsx             # variant-based button primitive
    Input.tsx              # label + input + error wrapper
  CardBrand.tsx            # inline-SVG Visa/MC/Amex marks
  CardChip.tsx             # inline-SVG EMV chip
  CardInput.tsx            # card-number input with brand badge inline
  CardPreview.tsx          # 3D-flipping card visual
  PaymentFlow.tsx          # orchestrator: form ↔ status screen + history
  PaymentForm.tsx          # main form
  StatusScreen.tsx         # processing/success/failed/timeout result UI
  TransactionHistory.tsx   # virtualised list with expand/collapse
hooks/
  useCardForm.ts           # form state, errors, touched, input transforms
  usePayment.ts            # fetch + AbortController + retry orchestration
store/
  paymentStore.ts          # Zustand store with persist middleware
types/
  payment.ts               # PaymentPayload, Transaction, PaymentStatus, etc.
utils/
  cardType.ts              # brand detection + per-brand config
  constants.ts             # timeouts, retry limits, currencies, failure reasons
  format.ts                # card number, amount, timestamp formatters
  validation.ts            # per-field validators + Luhn check
```

## How It Works

**Lifecycle.** `Idle → Processing → (Success | Failed | Timeout)`. The store holds the live status; `PaymentFlow` swaps between `PaymentForm` (idle) and `StatusScreen` (any other state) based on it.

**Idempotency.** A `transactionId` is generated via `crypto.randomUUID()` at the moment of first submit. Every retry reuses the same id, so the history record updates in place rather than duplicating.

**Timeouts.** Two timers run in parallel — the frontend `AbortController` fires at 6 seconds, and the mock gateway stalls 8 seconds on the timeout outcome. The frontend abort always wins; the rejection maps to the `timeout` state via `AbortError`. If the abort somehow doesn't fire, the server still returns a "Gateway timeout" failure for graceful degradation.

**Processing minimum.** `Promise.all([fetchPromise, delay(2000)])` ensures the user always sees ~2s of "Processing…" UI. Fast gateway responses don't flash the result.

**Three failure modes, three messages.** Network errors (`fetch` rejects), gateway errors (`response.ok === false`), and gateway-returned declines (`data.status === "failed"`) are mapped to distinct user-facing messages. Raw error objects are never exposed.

**Retry.** Capped at 3 attempts per `transactionId`. After three failures the retry button is removed and a final-failure message replaces it. Driven by `selectCanRetry` and `selectAttemptsExhausted`.

**Persistence.** Transaction history is persisted to `localStorage` via Zustand's `persist` middleware. Only safe metadata (last-4, brand, amount, status, timestamps) is whitelisted via `partialize` — full card numbers and CVVs are held in memory only and discarded after the payment completes.

**Virtualisation.** `TransactionHistory` uses `react-virtuoso` so DOM cost stays constant regardless of dataset size. Variable item heights (collapsed vs expanded with the details panel) work via Virtuoso's built-in `ResizeObserver` integration. Per-row React keys are derived from `transactionId`, which keeps `selectedId` correctly pinned across retries that mutate a record in place.

## Assumptions

- **Tailwind v4 syntax** — `@import "tailwindcss"` plus `@theme` for design tokens. v3 would need the `@tailwind base/components/utilities` directives plus a `tailwind.config.ts` with theme extensions.
- **CSS approach** — semantic class names (`btn-primary`, `card-front`, `input-error`) defined in `@layer components` with `@apply`. Inline Tailwind utilities are kept out of JSX where possible.
- **Validation timing** — errors are silent until a field is blurred (touched), then update on every keystroke until valid. The spec allows either "as user types **or** on blur"; this hybrid is the friendliest version.
- **Mastercard prefix detection** — uses 51–55 only. The newer 2221–2720 range was left out for simplicity but is trivial to add via one extra regex in `utils/cardType.ts`.
- **Cardholder name validation** — letters plus `. ' -`. International names with diacritics or non-Latin scripts would need a more permissive regex.
- **Currencies** — INR and USD per the spec, formatted with `Intl.NumberFormat` and locale-appropriate symbols.
- **Approval code** — generated client-side by the mock gateway as a 6-character alphanumeric string. A real gateway would return its own format.
- **Outcome distribution** — exact 60% success / 25% failure / 15% timeout. Real gateways have ~95%+ success rates; the high failure/timeout rates here exist for testability.
- **No server-side idempotency caching** — each request gets a fresh random outcome regardless of `transactionId`. This is intentional: caching would mean a `failed` payment never retries successfully, which would defeat the retry-flow tests.
- **Single in-flight transaction** — only one payment may be processing at a time. The submit button is disabled and the hook short-circuits if a payment is already in progress.
- **`localStorage` graceful degradation** — if storage is blocked (private browsing, full quota), the form still works; history just won't persist.
- **Card preview backgrounds** — five gradient variants picked at random on mount, instead of the 25 photo backgrounds in the design reference. Pure CSS, no asset folder, no external requests.
- **History panel height** — fixed 400px. Reasonable on mobile and desktop; could be made viewport-relative.

## What I'd Improve Given More Time

### UX polish
- **Animations** — port the slide-fade transitions from the Vue reference for digit/character changes on the card preview, probably with Framer Motion.
- **Animated focus indicator** — the glowing rectangle that follows the focused input across the card preview (in the reference design). Skipped for MVP because it adds non-trivial state.
- **Card preview backgrounds** — currently five gradients; a polished version would use 25 `next/image`-served photo backgrounds, matched to the reference.
- **Auto-focus on form return** — after "Make another payment", focus could land on the first incomplete field rather than relying on tab.
- **Toast system** — for transient errors not tied to lifecycle (e.g., "history failed to load"), a toast is cleaner than inline messages.

### Engineering
- **Tests** — the validators, formatters, store actions, and `usePayment` are mostly pure and would benefit from Vitest + React Testing Library coverage. None shipped due to time.
- **Error boundary** — wrap `PaymentFlow` in a React error boundary so a render crash shows a friendly fallback instead of a blank page.
- **API request validation with Zod** — the route handler currently does manual type narrowing for the body. Zod would give better runtime errors and mirror the frontend type definitions.
- **Server-side idempotency cache (optional)** — store outcomes by `transactionId` with a short TTL so duplicate POSTs return cached results. Real gateways do this; the mock skips it deliberately for testability.
- **Accessibility audit** — the basics are in place (labels, `aria-describedby`, `role="alert"`, focus management on transitions, `aria-live` on the status screen). I'd run axe-core, do a thorough keyboard-only walkthrough, and convert the expiry double-select into a proper `<fieldset>`/`<legend>` for semantic correctness.

### Architecture
- **Extract `Select` and `ExpirySelect` primitives** — the currency select and expiry double-select are still inline in the form. Pulling them out would match the cleanliness of the `Input`/`Button` primitives.
- **Transaction filters** — search, filter-by-status, date range. Useful once the list grows past a few dozen entries.
- **Clear history action** — a "Clear all" button with confirmation. Currently you have to clear `localStorage` manually via DevTools.
- **Settings sheet** — locale, default currency, history clear, dev-only force-outcome toggle. None of this is needed for the MVP, but it would round the app out.

### Real-world considerations skipped
- **PCI compliance** — a real implementation would never see the CVV in JS at all; it would tokenise via a hosted iframe (Stripe Elements, etc.). The whole point of this assignment is to demonstrate the lifecycle/UX considerations, so I held the card data in memory directly.
- **Rate limiting / abuse protection** — the `/api/pay` endpoint has none.
- **Observability** — `console.log` in dev mode is the entire telemetry surface. Production would need structured logging, error tracking (Sentry), and metrics.