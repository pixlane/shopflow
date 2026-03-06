/**
 * lib/payment/adapters/mock.ts
 *
 * Mock payment adapter for local development and testing.
 * Always succeeds (unless you pass a special trigger amount).
 *
 * Trigger amounts (last 2 digits of total):
 *   xx.01  → simulate failure
 *   xx.02  → simulate pending / requires_action
 *   anything else → success
 */

import type {
  PaymentAdapter,
  ProviderMeta,
  ProviderConfig,
  ConfigField,
  InitializePaymentRequest,
  PaymentSession,
  PaymentResult,
  RefundRequest,
  RefundResult,
} from "../types";

function uid() {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const MockAdapter: PaymentAdapter = {
  // ── Meta ───────────────────────────────────────────────────────────────────

  meta: {
    id: "mock",
    name: "Mock / Test",
    description: "Simulated payment provider for development. Never charges real money.",
    currencies: ["USD", "EUR", "TRY", "GBP"],
    markets: ["*"],
    checkoutMode: "embedded",
    logo: "mock.svg",
  },

  // ── Config fields ──────────────────────────────────────────────────────────

  configFields: [
    {
      key: "autoSucceed",
      label: "Auto-succeed payments",
      type: "toggle",
      hint: "When enabled all payments succeed instantly. Disable to test failure flows.",
      required: false,
    },
    {
      key: "delayMs",
      label: "Simulated delay (ms)",
      type: "number",
      placeholder: "800",
      hint: "Artificial async delay to simulate network latency.",
      required: false,
    },
  ],

  // ── Validate ───────────────────────────────────────────────────────────────

  validateConfig(_config: ProviderConfig): string | null {
    return null; // mock always valid
  },

  // ── Initialize ─────────────────────────────────────────────────────────────

  async initializePayment(
    request: InitializePaymentRequest,
    config: ProviderConfig
  ): Promise<PaymentSession> {
    const delay = Number(config.options?.delayMs ?? 600);
    await sleep(delay);

    const sessionId = uid();
    const cents = request.amount.amount;
    const lastTwo = cents % 100;

    // Simulate failure trigger
    const willFail = lastTwo === 1;
    const willPend = lastTwo === 2;

    return {
      sessionId,
      providerReference: `mock_pi_${sessionId}`,
      providerId: "mock",
      status: willFail ? "failed" : willPend ? "processing" : "pending",
      checkoutMode: "embedded",
      clientToken: JSON.stringify({
        sessionId,
        orderId: request.orderId,
        amount: request.amount,
        trigger: willFail ? "fail" : willPend ? "pend" : "succeed",
        buyer: { name: request.buyer.name, email: request.buyer.email },
      }),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: {
        orderId: request.orderId,
        idempotencyKey: request.idempotencyKey,
      },
    };
  },

  // ── Callback ───────────────────────────────────────────────────────────────

  async handleCallback(
    payload: Record<string, unknown>,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    const delay = Number(config.options?.delayMs ?? 400);
    await sleep(delay);

    const sessionId = String(payload.sessionId ?? "");
    const trigger = String(payload.trigger ?? "succeed");
    const orderId = String(payload.orderId ?? "");
    const amount = payload.amount as { amount: number; currency: string };

    const status =
      trigger === "fail"
        ? "failed"
        : trigger === "pend"
        ? "requires_action"
        : "succeeded";

    return {
      sessionId,
      providerReference: `mock_pi_${sessionId}`,
      providerId: "mock",
      orderId,
      status,
      amount: { amount: amount?.amount ?? 0, currency: amount?.currency ?? "USD" },
      rawResponse: payload,
      errorCode: status === "failed" ? "MOCK_FAILURE" : undefined,
      errorMessage: status === "failed" ? "Simulated payment failure (trigger amount)" : undefined,
      processedAt: new Date().toISOString(),
    };
  },

  // ── Status ─────────────────────────────────────────────────────────────────

  async getPaymentStatus(
    sessionId: string,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    const delay = Number(config.options?.delayMs ?? 400);
    await sleep(delay);

    // In mock mode we always report succeeded for existing sessions
    return {
      sessionId,
      providerReference: `mock_pi_${sessionId}`,
      providerId: "mock",
      orderId: "unknown",
      status: "succeeded",
      amount: { amount: 0, currency: "USD" },
      processedAt: new Date().toISOString(),
    };
  },

  // ── Refund ─────────────────────────────────────────────────────────────────

  async refund(
    request: RefundRequest,
    config: ProviderConfig
  ): Promise<RefundResult> {
    const delay = Number(config.options?.delayMs ?? 600);
    await sleep(delay);

    return {
      refundId: `mock_re_${uid()}`,
      sessionId: request.sessionId,
      status: "succeeded",
      amount: request.amount,
      processedAt: new Date().toISOString(),
    };
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
