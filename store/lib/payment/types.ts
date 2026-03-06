/**
 * lib/payment/types.ts
 *
 * Canonical payment types shared across all adapters.
 * Adapters translate their provider-specific responses INTO these types.
 * Nothing outside lib/payment should import provider-specific shapes.
 */

// ─── Provider identity ────────────────────────────────────────────────────────

export type ProviderId = "mock" | "stripe" | "iyzico" | "paytr";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  description: string;
  /** Currencies the provider supports */
  currencies: string[];
  /** Countries / markets the provider is available in */
  markets: string[];
  /** Whether the checkout happens on our page or redirects to provider */
  checkoutMode: "hosted" | "embedded" | "redirect";
  /** Logo filename (resolved under /public/providers/) */
  logo: string;
}

// ─── Configuration stored per-provider ───────────────────────────────────────

export interface ProviderConfig {
  providerId: ProviderId;
  enabled: boolean;
  /** Alias shown in admin */
  label: string;
  /**
   * Generic key/value bag.
   * Each adapter declares which keys it needs via `configFields`.
   * Values are NEVER shipped to the client — server-only.
   */
  credentials: Record<string, string>;
  /** Test vs live mode toggle */
  mode: "test" | "live";
  /** Adapter-specific UI options (e.g. installment count) */
  options: Record<string, string | number | boolean>;
}

// ─── Amount type ──────────────────────────────────────────────────────────────

export interface Money {
  amount: number;   // integer cents (e.g. 1999 = $19.99) OR kuruş (₺19.99 = 1999)
  currency: string; // ISO 4217: "USD" | "TRY" | "EUR"
}

// ─── Payment session ──────────────────────────────────────────────────────────

/**
 * Returned by `initializePayment`.
 * The frontend uses this to either redirect, mount a widget, or show a form.
 */
export interface PaymentSession {
  /** Unique session ID in OUR system */
  sessionId: string;
  /** Provider's own token / payment intent ID */
  providerReference: string;
  providerId: ProviderId;
  status: PaymentSessionStatus;
  /**
   * hosted  → redirect user to this URL
   * embedded → mount provider's JS widget using `clientToken`
   * redirect → POST form action (PayTR style)
   */
  checkoutMode: "hosted" | "embedded" | "redirect";
  /** For hosted/redirect modes */
  redirectUrl?: string;
  /** For embedded mode (Stripe clientSecret, Iyzico checkoutFormContent) */
  clientToken?: string;
  /** For redirect POST forms (PayTR token) */
  formToken?: string;
  /** ISO timestamp */
  expiresAt: string;
  metadata: Record<string, string>;
}

export type PaymentSessionStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

// ─── Payment result ───────────────────────────────────────────────────────────

/** Canonical result after provider confirms / webhooks back */
export interface PaymentResult {
  sessionId: string;
  providerReference: string;
  providerId: ProviderId;
  orderId: string;
  status: PaymentResultStatus;
  amount: Money;
  /** Provider-specific raw response (for logging/debugging only) */
  rawResponse?: unknown;
  /** Populated on failure */
  errorCode?: string;
  errorMessage?: string;
  /** ISO timestamp */
  processedAt: string;
}

export type PaymentResultStatus =
  | "succeeded"
  | "failed"
  | "requires_action"
  | "refunded"
  | "partially_refunded";

// ─── Refund ───────────────────────────────────────────────────────────────────

export interface RefundRequest {
  sessionId: string;
  orderId: string;
  amount: Money;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  sessionId: string;
  status: "succeeded" | "pending" | "failed";
  amount: Money;
  processedAt: string;
}

// ─── Buyer / shipping info passed to providers ────────────────────────────────

export interface PaymentBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  ip: string;
  identityNumber?: string; // required by Iyzico
  registrationDate?: string;
  lastLoginDate?: string;
}

export interface PaymentAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface PaymentBasketItem {
  id: string;
  name: string;
  category: string;
  price: number;     // unit price in minor currency
  quantity: number;
  itemType?: "PHYSICAL" | "VIRTUAL";
}

// ─── The main initialize request shape ───────────────────────────────────────

export interface InitializePaymentRequest {
  orderId: string;
  amount: Money;
  buyer: PaymentBuyer;
  shippingAddress: PaymentAddress;
  billingAddress: PaymentAddress;
  basketItems: PaymentBasketItem[];
  /** URL to redirect after success */
  callbackUrl: string;
  /** URL to redirect on cancel / failure */
  cancelUrl: string;
  /** Idempotency key — prevents duplicate charges on retry */
  idempotencyKey: string;
  /** Free-form metadata */
  metadata?: Record<string, string>;
}

// ─── Config field descriptor (for admin UI rendering) ────────────────────────

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "toggle" | "number";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  /** If true, value is NEVER shown in UI once saved */
  secret?: boolean;
}

// ─── The adapter interface every provider must implement ─────────────────────

export interface PaymentAdapter {
  /** Static metadata (name, logo, supported currencies…) */
  readonly meta: ProviderMeta;

  /**
   * Declares which config fields the admin form should render.
   * Adapters should list all keys they read from `config.credentials`.
   */
  readonly configFields: ConfigField[];

  /**
   * Validate the current config (check required keys are present).
   * Returns null if valid, or an error message.
   */
  validateConfig(config: ProviderConfig): string | null;

  /**
   * Start a payment flow.
   * Returns a `PaymentSession` describing how the frontend should proceed.
   */
  initializePayment(
    request: InitializePaymentRequest,
    config: ProviderConfig
  ): Promise<PaymentSession>;

  /**
   * Handle the raw callback/webhook payload from the provider.
   * Validates signatures, maps to canonical `PaymentResult`.
   */
  handleCallback(
    payload: Record<string, unknown>,
    config: ProviderConfig
  ): Promise<PaymentResult>;

  /**
   * Query the current status of a payment session.
   */
  getPaymentStatus(
    sessionId: string,
    config: ProviderConfig
  ): Promise<PaymentResult>;

  /**
   * Issue a (partial) refund.
   */
  refund(
    request: RefundRequest,
    config: ProviderConfig
  ): Promise<RefundResult>;
}
