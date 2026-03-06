/**
 * lib/payment/adapters/paytr.ts
 *
 * PayTR iFrame API adapter.
 *
 * Checkout mode: "redirect"
 *   PayTR generates a token; the frontend POSTs to PayTR's iframe URL
 *   which renders inside our page. On success PayTR POSTs back to our
 *   callback URL (server-to-server notification).
 *
 * Docs: https://dev.paytr.com/iframe-api
 *
 * HMAC signature formula (SHA-256):
 *   merchant_id + user_ip + merchant_oid + email + payment_amount
 *   + user_basket + no_installment + max_installment + currency + test_mode
 *   + paytr_token  (= base64(hmac_sha256(string, merchant_key + merchant_salt)))
 *
 * Real integration checklist:
 *   1. Set PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT in .env.local
 *   2. Uncomment the real implementation sections below
 *   3. Register callback: /api/payment/callback?provider=paytr  (POST, no auth header)
 *   4. PayTR requires callback to return plain text "OK"
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

const PAYTR_META: ProviderMeta = {
  id: "paytr",
  name: "PayTR",
  description: "Türkiye'nin popüler ödeme altyapısı. Tüm kartlar, taksit, BKM Express.",
  currencies: ["TRY"],
  markets: ["TR"],
  checkoutMode: "redirect",
  logo: "paytr.svg",
};

// ─── Config fields ────────────────────────────────────────────────────────────

const PAYTR_CONFIG_FIELDS: ConfigField[] = [
  {
    key: "merchantId",
    label: "Merchant ID",
    type: "text",
    placeholder: "123456",
    required: true,
    hint: "PayTR Merchant Panel → Mağaza Bilgileri → Mağaza No",
  },
  {
    key: "merchantKey",
    label: "Merchant Key",
    type: "password",
    placeholder: "xxxxxxxxxxxxxxxxxxxx",
    required: true,
    secret: true,
    hint: "PayTR Merchant Panel → Mağaza Bilgileri → Mağaza Anahtar",
  },
  {
    key: "merchantSalt",
    label: "Merchant Salt",
    type: "password",
    placeholder: "xxxxxxxxxxxxxxxxxxxx",
    required: true,
    secret: true,
    hint: "PayTR Merchant Panel → Mağaza Bilgileri → Mağaza Parola",
  },
  {
    key: "maxInstallment",
    label: "Maksimum Taksit",
    type: "select",
    required: false,
    options: [
      { value: "0", label: "Taksit yok (0)" },
      { value: "3", label: "3 Taksit" },
      { value: "6", label: "6 Taksit" },
      { value: "9", label: "9 Taksit" },
      { value: "12", label: "12 Taksit" },
    ],
  },
  {
    key: "noInstallment",
    label: "Taksiti Engelle",
    type: "toggle",
    hint: "Aktif ise taksit seçeneği gösterilmez.",
    required: false,
  },
  {
    key: "lang",
    label: "Dil",
    type: "select",
    required: false,
    options: [
      { value: "tr", label: "Türkçe" },
      { value: "en", label: "English" },
    ],
  },
];

// ─── Adapter ──────────────────────────────────────────────────────────────────

export const PayTRAdapter: PaymentAdapter = {
  meta: PAYTR_META,
  configFields: PAYTR_CONFIG_FIELDS,

  // ── Validate ─────────────────────────────────────────────────────────────

  validateConfig(config: ProviderConfig): string | null {
    const { merchantId, merchantKey, merchantSalt } = config.credentials;
    if (!merchantId) return "PayTR Merchant ID zorunludur.";
    if (!merchantKey) return "PayTR Merchant Key zorunludur.";
    if (!merchantSalt) return "PayTR Merchant Salt zorunludur.";
    return null;
  },

  // ── Initialize ────────────────────────────────────────────────────────────

  async initializePayment(
    request: InitializePaymentRequest,
    config: ProviderConfig
  ): Promise<PaymentSession> {
    const merchantOid = request.orderId;
    const testMode = config.mode === "test" ? "1" : "0";
    const noInstallment = config.credentials.noInstallment === "true" ? "1" : "0";
    const maxInstallment = String(config.credentials.maxInstallment ?? "0");
    const lang = String(config.credentials.lang ?? "tr");

    // PayTR expects basket as JSON array: [["name", "price_str", qty], ...]
    const userBasket = btoa(
      JSON.stringify(
        request.basketItems.map((item) => [
          item.name,
          (item.price / 100).toFixed(2),
          item.quantity,
        ])
      )
    );

    /* ── REAL PAYTR CODE (uncomment when ready) ───────────────────────────
    const { createHmac } = await import("crypto");

    const { merchantId, merchantKey, merchantSalt } = config.credentials;
    const paymentAmount = String(request.amount.amount); // kuruş

    // Build the hash string exactly as PayTR docs specify
    const hashStr =
      merchantId +
      request.buyer.ip +
      merchantOid +
      request.buyer.email +
      paymentAmount +
      userBasket +
      noInstallment +
      maxInstallment +
      request.amount.currency +
      testMode;

    const paytrToken = createHmac("sha256", merchantKey + merchantSalt)
      .update(hashStr)
      .digest("base64");

    const formData = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: request.buyer.ip,
      merchant_oid: merchantOid,
      email: request.buyer.email,
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: testMode,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: `${request.buyer.name} ${request.buyer.surname}`,
      user_address: request.shippingAddress.address,
      user_phone: request.buyer.phone ?? "",
      merchant_ok_url: request.callbackUrl,
      merchant_fail_url: request.cancelUrl,
      timeout_limit: "30",
      currency: request.amount.currency,
      test_mode: testMode,
      lang,
    });

    const resp = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const json = await resp.json() as { status: string; token?: string; reason?: string };
    if (json.status !== "success") throw new Error(json.reason ?? "PayTR token alınamadı");

    return {
      sessionId: merchantOid,
      providerReference: json.token!,
      providerId: "paytr",
      status: "pending",
      checkoutMode: "redirect",
      formToken: json.token,
      // PayTR iframe: <iframe src="https://www.paytr.com/odeme/guvenli/TOKEN" />
      redirectUrl: `https://www.paytr.com/odeme/guvenli/${json.token}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: { orderId: request.orderId, merchantOid },
    };
    ── END REAL CODE ── */

    // ── MOCK ─────────────────────────────────────────────────────────────
    const mockToken = `paytr_tok_${merchantOid}_${Date.now().toString(36)}`;

    return {
      sessionId: merchantOid,
      providerReference: mockToken,
      providerId: "paytr",
      status: "pending",
      checkoutMode: "redirect",
      formToken: mockToken,
      // In real mode this would be the PayTR iframe URL
      redirectUrl: `/store/checkout/paytr-frame?token=${mockToken}&orderId=${merchantOid}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: {
        orderId: request.orderId,
        merchantOid,
        testMode,
        lang,
        userBasket,
      },
    };
  },

  // ── Callback (server-to-server POST from PayTR) ───────────────────────────

  async handleCallback(
    payload: Record<string, unknown>,
    config: ProviderConfig
  ): Promise<PaymentResult> {
    /* ── REAL SIGNATURE VERIFICATION ──────────────────────────────────────
    const { createHmac } = await import("crypto");
    const { merchantKey, merchantSalt } = config.credentials;

    const hashStr =
      payload.merchant_oid +
      merchantSalt +
      payload.status +
      payload.total_amount;

    const expectedToken = createHmac("sha256", merchantKey + merchantSalt)
      .update(String(hashStr))
      .digest("base64");

    if (expectedToken !== payload.hash) {
      throw new Error("PayTR: invalid callback signature");
    }
    ── END REAL VERIFICATION ── */

    const status = String(payload.status ?? payload.payment_status ?? "failed");
    const succeeded = status === "success" || status === "1";
    const orderId = String(payload.merchant_oid ?? payload.orderId ?? "");

    return {
      sessionId: orderId,
      providerReference: String(payload.paytr_token ?? payload.token ?? ""),
      providerId: "paytr",
      orderId,
      status: succeeded ? "succeeded" : "failed",
      amount: {
        amount: Number(payload.total_amount ?? payload.payment_amount ?? 0),
        currency: String(payload.currency ?? "TRY"),
      },
      rawResponse: payload,
      errorCode: !succeeded ? String(payload.failed_reason_code ?? "PAYTR_FAILURE") : undefined,
      errorMessage: !succeeded ? String(payload.failed_reason_msg ?? "Ödeme başarısız") : undefined,
      processedAt: new Date().toISOString(),
    };
  },

  // ── Status ────────────────────────────────────────────────────────────────

  async getPaymentStatus(
    sessionId: string,
    _config: ProviderConfig
  ): Promise<PaymentResult> {
    // PayTR doesn't have a query-by-ID endpoint; status comes via callback only.
    // In production you'd track status in your DB after the callback fires.
    return {
      sessionId,
      providerReference: sessionId,
      providerId: "paytr",
      orderId: sessionId,
      status: "succeeded",
      amount: { amount: 0, currency: "TRY" },
      processedAt: new Date().toISOString(),
    };
  },

  // ── Refund ────────────────────────────────────────────────────────────────

  async refund(
    request: RefundRequest,
    config: ProviderConfig
  ): Promise<RefundResult> {
    /* ── REAL CODE ──
    const { createHmac } = await import("crypto");
    const { merchantId, merchantKey, merchantSalt } = config.credentials;

    const hashStr = merchantId + request.sessionId + (request.amount.amount / 100).toFixed(2) + merchantSalt;
    const token = createHmac("sha256", merchantKey).update(hashStr).digest("base64");

    await fetch("https://www.paytr.com/odeme/iade", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        merchant_id: merchantId,
        merchant_oid: request.sessionId,
        return_amount: (request.amount.amount / 100).toFixed(2),
        paytr_token: token,
      }).toString(),
    });
    ── END REAL CODE ── */

    return {
      refundId: `paytr_re_${Date.now().toString(36)}`,
      sessionId: request.sessionId,
      status: "succeeded",
      amount: request.amount,
      processedAt: new Date().toISOString(),
    };
  },
};
