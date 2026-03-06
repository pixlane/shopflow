/**
 * lib/payment/adapters/iyzico.ts
 *
 * Iyzico payment adapter (Turkey's leading payment provider).
 *
 * Checkout mode: "embedded" — Iyzico injects an iframe/form into the page
 * via their JS SDK using the `checkoutFormContent` token.
 *
 * Docs: https://dev.iyzipay.com/tr/
 *
 * Real integration checklist:
 *   1. npm install iyzipay   (or use the REST API directly)
 *   2. Replace mock responses below with real Iyzipay SDK calls
 *   3. Set IYZICO_API_KEY and IYZICO_SECRET_KEY in .env.local
 *   4. Register callback: /api/payment/callback?provider=iyzico
 *
 * HMAC signature formula:
 *   base64( SHA-256( apiKey + random + secretKey + conversationId + price ) )
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

const IYZICO_META: ProviderMeta = {
  id: "iyzico",
  name: "Iyzico",
  description: "Turkey's leading payment provider. Cards, instalment, BKM Express, Papara.",
  currencies: ["TRY"],
  markets: ["TR"],
  checkoutMode: "embedded",
  logo: "iyzico.svg",
};

// ─── Config fields ────────────────────────────────────────────────────────────

const IYZICO_CONFIG_FIELDS: ConfigField[] = [
  {
    key: "apiKey",
    label: "API Key",
    type: "text",
    placeholder: "sandbox-…  or  live-…",
    required: true,
    hint: "Found in Iyzico Merchant Panel → Ayarlar → API Bilgileri.",
  },
  {
    key: "secretKey",
    label: "Secret Key",
    type: "password",
    placeholder: "sandbox-…  or  live-…",
    required: true,
    secret: true,
    hint: "Keep this server-side only.",
  },
  {
    key: "baseUrl",
    label: "API Base URL",
    type: "select",
    required: true,
    options: [
      { value: "https://sandbox-api.iyzipay.com", label: "Sandbox (test)" },
      { value: "https://api.iyzipay.com", label: "Production" },
    ],
  },
  {
    key: "installments",
    label: "Max instalments",
    type: "select",
    required: false,
    options: [
      { value: "1", label: "No instalment" },
      { value: "3", label: "Up to 3" },
      { value: "6", label: "Up to 6" },
      { value: "9", label: "Up to 9" },
      { value: "12", label: "Up to 12" },
    ],
    hint: "Maximum number of instalments to offer at checkout.",
  },
  {
    key: "locale",
    label: "Checkout Locale",
    type: "select",
    required: false,
    options: [
      { value: "tr", label: "Türkçe" },
      { value: "en", label: "English" },
    ],
  },
];

// ─── Adapter ──────────────────────────────────────────────────────────────────

export const IyzicoAdapter: PaymentAdapter = {
  meta: IYZICO_META,
  configFields: IYZICO_CONFIG_FIELDS,

  // ── Validate ─────────────────────────────────────────────────────────────

  validateConfig(config: ProviderConfig): string | null {
    if (!config.credentials.apiKey) return "Iyzico API Key is required.";
    if (!config.credentials.secretKey) return "Iyzico Secret Key is required.";
    if (!config.credentials.baseUrl) return "API Base URL is required.";
    return null;
  },

  // ── Initialize ────────────────────────────────────────────────────────────

  async initializePayment(
    request: InitializePaymentRequest,
    config: ProviderConfig
  ): Promise<PaymentSession> {
    const conversationId = `iy_${request.orderId}_${Date.now()}`;
    const locale = String(config.credentials.locale ?? "tr");

    /* ── REAL IYZICO CODE (uncomment when ready) ──────────────────────────
    const Iyzipay = require("iyzipay");
    const iyzipay = new Iyzipay({
      apiKey: config.credentials.apiKey,
      secretKey: config.credentials.secretKey,
      uri: config.credentials.baseUrl,
    });

    const checkoutFormInitRequest = {
      locale,
      conversationId,
      price: (request.amount.amount / 100).toFixed(2),     // Iyzico uses decimal TRY
      paidPrice: (request.amount.amount / 100).toFixed(2),
      currency: "TRY",
      basketId: request.orderId,
      paymentGroup: "PRODUCT",
      callbackUrl: request.callbackUrl,
      enabledInstallments: buildInstallmentList(config.credentials.installments),
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        identityNumber: request.buyer.identityNumber ?? "11111111111",
        email: request.buyer.email,
        gsmNumber: request.buyer.phone ?? "",
        registrationDate: request.buyer.registrationDate ?? "2024-01-01 00:00:00",
        lastLoginDate: request.buyer.lastLoginDate ?? "2024-01-01 00:00:00",
        registrationAddress: request.billingAddress.address,
        ip: request.buyer.ip,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category,
        itemType: item.itemType ?? "PHYSICAL",
        price: (item.price / 100).toFixed(2),
      })),
    };

    const result = await new Promise<Record<string, string>>((res, rej) =>
      iyzipay.checkoutFormInitialize.create(checkoutFormInitRequest, (err: unknown, r: unknown) =>
        err ? rej(err) : res(r as Record<string, string>)
      )
    );

    if (result.status !== "success") throw new Error(result.errorMessage ?? "Iyzico init failed");

    return {
      sessionId: conversationId,
      providerReference: result.token,
      providerId: "iyzico",
      status: "pending",
      checkoutMode: "embedded",
      clientToken: result.checkoutFormContent,   // raw HTML snippet with iframe
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: { orderId: request.orderId, token: result.token },
    };
    ── END REAL CODE ── */

    // ── MOCK ─────────────────────────────────────────────────────────────
    const mockToken = `iy_tok_${conversationId}_${Date.now()}`;
    const mockFormContent = `
      <!-- Iyzico Checkout Form (MOCK) -->
      <div id="iyzipay-checkout-form" class="popup">
        <script src="https://sandbox-static.iyzipay.com/checkoutform/v2/bundle.js?token=${mockToken}"></script>
      </div>
    `.trim();

    return {
      sessionId: conversationId,
      providerReference: mockToken,
      providerId: "iyzico",
      status: "pending",
      checkoutMode: "embedded",
      clientToken: mockFormContent,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: { orderId: request.orderId, token: mockToken, locale },
    };
  },

  // ── Callback ──────────────────────────────────────────────────────────────

  async handleCallback(
    payload: Record<string, unknown>,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    const token = String(payload.token ?? "");
    const status = String(payload.status ?? "failure");
    const conversationId = String(payload.conversationId ?? payload.sessionId ?? "");

    /* ── REAL CODE ──
    const Iyzipay = require("iyzipay");
    const iyzipay = new Iyzipay({ apiKey: ..., secretKey: ..., uri: ... });

    const result = await new Promise<Record<string, unknown>>((res, rej) =>
      iyzipay.checkoutForm.retrieve({ locale: "tr", conversationId, token }, (err: unknown, r: unknown) =>
        err ? rej(err) : res(r as Record<string, unknown>)
      )
    );

    const succeeded = result.paymentStatus === "SUCCESS";
    ── END REAL CODE ── */

    const succeeded = status === "success" || status === "SUCCESS";

    return {
      sessionId: conversationId,
      providerReference: token,
      providerId: "iyzico",
      orderId: String(payload.orderId ?? payload.basketId ?? ""),
      status: succeeded ? "succeeded" : "failed",
      amount: {
        amount: Number(payload.paidPrice ?? payload.price ?? 0),
        currency: "TRY",
      },
      rawResponse: payload,
      errorCode: !succeeded ? String(payload.errorCode ?? "IYZICO_FAILURE") : undefined,
      errorMessage: !succeeded ? String(payload.errorMessage ?? "Payment failed") : undefined,
      processedAt: new Date().toISOString(),
    };
  },

  // ── Status ────────────────────────────────────────────────────────────────

  async getPaymentStatus(
    sessionId: string,
    _config: ProviderConfig
  ): Promise<PaymentResult> {
    return {
      sessionId,
      providerReference: sessionId,
      providerId: "iyzico",
      orderId: "",
      status: "succeeded",
      amount: { amount: 0, currency: "TRY" },
      processedAt: new Date().toISOString(),
    };
  },

  // ── Refund ────────────────────────────────────────────────────────────────

  async refund(
    request: RefundRequest,
    _config: ProviderConfig
  ): Promise<RefundResult> {
    /* ── REAL CODE ──
    iyzipay.refund.create({
      paymentTransactionId: request.sessionId,
      price: (request.amount.amount / 100).toFixed(2),
      currency: "TRY",
      ip: "127.0.0.1",
    }, ...);
    ── END REAL CODE ── */

    return {
      refundId: `iy_re_${Date.now()}`,
      sessionId: request.sessionId,
      status: "succeeded",
      amount: request.amount,
      processedAt: new Date().toISOString(),
    };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInstallmentList(max: string | undefined): number[] {
  const n = parseInt(max ?? "1");
  const valid = [1, 2, 3, 6, 9, 12];
  return valid.filter((x) => x <= n);
}
