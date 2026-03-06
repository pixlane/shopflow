/**
 * lib/payment/adapters/stripe.ts
 *
 * Stripe Payment Intents adapter.
 *
 * Checkout mode: "embedded" (Stripe Elements / Payment Element)
 *
 * Real integration checklist (swap mock for live):
 *   1. npm install stripe
 *   2. Replace `MOCK_STRIPE_*` calls below with actual Stripe SDK calls
 *   3. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local
 *   4. Register webhook endpoint: /api/payment/callback?provider=stripe
 *
 * The shape of every request/response already matches Stripe's real API.
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

// ─── Provider metadata ────────────────────────────────────────────────────────

const STRIPE_META: ProviderMeta = {
  id: "stripe",
  name: "Stripe",
  description: "Global payment processing. Cards, Apple Pay, Google Pay, SEPA, and 135+ more methods.",
  currencies: ["USD", "EUR", "GBP", "TRY", "CAD", "AUD", "JPY"],
  markets: ["US", "EU", "GB", "TR", "CA", "AU", "JP", "Global"],
  checkoutMode: "embedded",
  logo: "stripe.svg",
};

// ─── Config field definitions ─────────────────────────────────────────────────

const STRIPE_CONFIG_FIELDS: ConfigField[] = [
  {
    key: "secretKey",
    label: "Secret Key",
    type: "password",
    placeholder: "sk_test_…  or  sk_live_…",
    required: true,
    secret: true,
    hint: "Found in Stripe Dashboard → Developers → API Keys.",
  },
  {
    key: "publishableKey",
    label: "Publishable Key",
    type: "text",
    placeholder: "pk_test_…  or  pk_live_…",
    required: true,
    hint: "Safe to expose to the browser.",
  },
  {
    key: "webhookSecret",
    label: "Webhook Signing Secret",
    type: "password",
    placeholder: "whsec_…",
    required: false,
    secret: true,
    hint: "From Stripe Dashboard → Developers → Webhooks. Required in production.",
  },
  {
    key: "paymentMethods",
    label: "Payment Methods",
    type: "text",
    placeholder: "card, apple_pay, google_pay",
    required: false,
    hint: "Comma-separated list. Leave blank for automatic.",
  },
  {
    key: "captureMethod",
    label: "Capture Method",
    type: "select",
    required: false,
    options: [
      { value: "automatic", label: "Automatic" },
      { value: "manual", label: "Manual (authorize only)" },
    ],
    hint: "Automatic captures immediately. Manual lets you capture later.",
  },
];

// ─── Adapter implementation ───────────────────────────────────────────────────

export const StripeAdapter: PaymentAdapter = {
  meta: STRIPE_META,
  configFields: STRIPE_CONFIG_FIELDS,

  // ── Validate ─────────────────────────────────────────────────────────────

  validateConfig(config: ProviderConfig): string | null {
    const { secretKey, publishableKey } = config.credentials;
    if (!secretKey) return "Stripe Secret Key is required.";
    if (!secretKey.startsWith("sk_"))
      return "Secret Key must start with sk_test_ or sk_live_.";
    if (!publishableKey) return "Stripe Publishable Key is required.";
    if (!publishableKey.startsWith("pk_"))
      return "Publishable Key must start with pk_test_ or pk_live_.";
    return null;
  },

  // ── Initialize ────────────────────────────────────────────────────────────

  async initializePayment(
    request: InitializePaymentRequest,
    config: ProviderConfig
  ): Promise<PaymentSession> {
    const isLive = config.mode === "live";

    /* ── REAL STRIPE CODE (commented out — uncomment when ready) ────────────
    const stripe = new Stripe(config.credentials.secretKey, { apiVersion: "2024-04-10" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: request.amount.amount,
      currency: request.amount.currency.toLowerCase(),
      capture_method: (config.options?.captureMethod as "automatic" | "manual") ?? "automatic",
      metadata: {
        orderId: request.orderId,
        idempotencyKey: request.idempotencyKey,
        ...(request.metadata ?? {}),
      },
      receipt_email: request.buyer.email,
      shipping: {
        name: request.shippingAddress.contactName,
        address: {
          line1: request.shippingAddress.address,
          city: request.shippingAddress.city,
          country: request.shippingAddress.country,
          postal_code: request.shippingAddress.zipCode ?? "",
        },
      },
    }, { idempotencyKey: request.idempotencyKey });

    return {
      sessionId: paymentIntent.id,
      providerReference: paymentIntent.id,
      providerId: "stripe",
      status: "pending",
      checkoutMode: "embedded",
      clientToken: paymentIntent.client_secret!,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      metadata: { orderId: request.orderId },
    };
    ── END REAL CODE ── */

    // ── MOCK IMPLEMENTATION ────────────────────────────────────────────────
    const piId = `pi_${randomHex(24)}`;
    const clientSecret = `${piId}_secret_${randomHex(24)}`;

    return {
      sessionId: piId,
      providerReference: piId,
      providerId: "stripe",
      status: "pending",
      checkoutMode: "embedded",
      clientToken: clientSecret,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      metadata: {
        orderId: request.orderId,
        publishableKey: config.credentials.publishableKey ?? `pk_${isLive ? "live" : "test"}_DEMO`,
      },
    };
  },

  // ── Callback (webhook) ────────────────────────────────────────────────────

  async handleCallback(
    payload: Record<string, unknown>,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    /* ── REAL CODE ──
    const sig = headers().get("stripe-signature");
    const event = stripe.webhooks.constructEvent(rawBody, sig, config.credentials.webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      return { sessionId: pi.id, status: "succeeded", ... };
    }
    ── END REAL CODE ── */

    const eventType = String(payload.type ?? "payment_intent.succeeded");
    const piData = (payload.data as { object?: { id?: string; metadata?: { orderId?: string }; amount?: number; currency?: string } })?.object ?? {};

    const status =
      eventType === "payment_intent.succeeded"
        ? "succeeded"
        : eventType === "payment_intent.payment_failed"
        ? "failed"
        : "requires_action";

    return {
      sessionId: String(piData.id ?? payload.id ?? ""),
      providerReference: String(piData.id ?? ""),
      providerId: "stripe",
      orderId: String(piData.metadata?.orderId ?? payload.orderId ?? ""),
      status,
      amount: {
        amount: Number(piData.amount ?? payload.amount ?? 0),
        currency: String(piData.currency ?? "usd").toUpperCase(),
      },
      rawResponse: payload,
      processedAt: new Date().toISOString(),
    };
  },

  // ── Status ────────────────────────────────────────────────────────────────

  async getPaymentStatus(
    sessionId: string,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    /* ── REAL CODE ──
    const stripe = new Stripe(config.credentials.secretKey, { apiVersion: "2024-04-10" });
    const pi = await stripe.paymentIntents.retrieve(sessionId);
    ── END REAL CODE ── */

    return {
      sessionId,
      providerReference: sessionId,
      providerId: "stripe",
      orderId: "",
      status: "succeeded", // mock: always succeeded
      amount: { amount: 0, currency: "USD" },
      processedAt: new Date().toISOString(),
    };
  },

  // ── Refund ────────────────────────────────────────────────────────────────

  async refund(
    request: RefundRequest,
    config: ProviderConfig
  ): Promise<RefundResult> {
    /* ── REAL CODE ──
    const stripe = new Stripe(config.credentials.secretKey, { apiVersion: "2024-04-10" });
    const refund = await stripe.refunds.create({
      payment_intent: request.sessionId,
      amount: request.amount.amount,
      reason: "requested_by_customer",
    });
    ── END REAL CODE ── */

    return {
      refundId: `re_${randomHex(24)}`,
      sessionId: request.sessionId,
      status: "succeeded",
      amount: request.amount,
      processedAt: new Date().toISOString(),
    };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomHex(length: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
