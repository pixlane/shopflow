// ── Payment abstraction layer ──────────────────────────────────────────────
// Provides a unified interface over multiple payment providers.
// Real provider integrations (Stripe, Iyzico, PayTR) are plugged in here.

export type ProviderId = 'mock' | 'stripe' | 'iyzico' | 'paytr'

export interface Money {
  amount: number   // in smallest unit (cents / kuruş)
  currency: string // e.g. "USD", "TRY"
}

export interface PaymentAddress {
  contactName: string
  city: string
  country: string
  address: string
  zipCode?: string
}

export interface PaymentBuyer {
  id: string
  name: string
  surname: string
  email: string
  phone?: string
  ip: string
  identityNumber?: string
}

export interface PaymentBasketItem {
  id: string
  name: string
  category: string
  price: number   // in smallest unit
  quantity: number
  itemType?: string
}

export interface InitializePaymentRequest {
  orderId: string
  amount: Money
  buyer: PaymentBuyer
  shippingAddress: PaymentAddress
  billingAddress: PaymentAddress
  basketItems: PaymentBasketItem[]
  callbackUrl: string
  cancelUrl: string
  idempotencyKey?: string
  metadata?: Record<string, string>
}

export interface PaymentSession {
  sessionId: string
  providerId: ProviderId
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  amount: Money
  orderId: string
  // Provider-specific tokens
  clientToken?: string       // Stripe client_secret / Iyzico HTML snippet
  formToken?: string         // PayTR form token
  redirectUrl?: string       // Redirect-based providers
  providerReference?: string // Provider's own session/payment ID
  expiresAt?: string
  metadata?: Record<string, string>
}

export interface CallbackResult {
  status: 'succeeded' | 'failed' | 'pending'
  orderId?: string
  sessionId?: string
  providerReference?: string
}

export interface ProviderConfig {
  providerId: ProviderId
  apiKey?: string
  secretKey?: string
  merchantId?: string
  sandbox?: boolean
  [key: string]: unknown
}

export interface PaymentAdapter {
  validateConfig(config: ProviderConfig): string | null
  initializePayment(request: InitializePaymentRequest, config: ProviderConfig): Promise<PaymentSession>
  handleCallback(payload: Record<string, unknown>, config: ProviderConfig): Promise<CallbackResult>
  getStatus(sessionId: string, config: ProviderConfig): Promise<PaymentSession>
}

// ── Admin snapshot ────────────────────────────────────────────────────────────
export interface ProviderSnapshot {
  activeProvider: ProviderId
  available: ProviderId[]
  sandbox: boolean
}

// ── Mock adapter (always available for dev/testing) ───────────────────────────
const mockAdapter: PaymentAdapter = {
  validateConfig: () => null,

  async initializePayment(req) {
    const sessionId = `mock_${req.orderId}_${Date.now()}`
    return {
      sessionId,
      providerId: 'mock',
      status: 'pending',
      amount: req.amount,
      orderId: req.orderId,
      clientToken: JSON.stringify({ orderId: req.orderId, sessionId }),
      providerReference: sessionId,
    }
  },

  async handleCallback(payload) {
    const { trigger, orderId, sessionId } = payload as { trigger?: string; orderId?: string; sessionId?: string }
    return {
      status: trigger === 'succeed' ? 'succeeded' : 'failed',
      orderId: orderId ?? '',
      sessionId: sessionId ?? '',
    }
  },

  async getStatus(sessionId) {
    return {
      sessionId,
      providerId: 'mock',
      status: 'pending',
      amount: { amount: 0, currency: 'USD' },
      orderId: '',
    }
  },
}

// ── Registry ──────────────────────────────────────────────────────────────────
const adapters: Record<ProviderId, PaymentAdapter> = {
  mock: mockAdapter,
  stripe: mockAdapter,   // swap with real Stripe adapter in production
  iyzico: mockAdapter,   // swap with real Iyzico adapter in production
  paytr: mockAdapter,    // swap with real PayTR adapter in production
}

const configs: Record<ProviderId, ProviderConfig> = {
  mock:   { providerId: 'mock', sandbox: true },
  stripe: { providerId: 'stripe', sandbox: true, apiKey: process.env.STRIPE_SECRET_KEY },
  iyzico: { providerId: 'iyzico', sandbox: true, apiKey: process.env.IYZICO_API_KEY, secretKey: process.env.IYZICO_SECRET_KEY },
  paytr:  { providerId: 'paytr', sandbox: true, merchantId: process.env.PAYTR_MERCHANT_ID, apiKey: process.env.PAYTR_MERCHANT_KEY, secretKey: process.env.PAYTR_MERCHANT_SALT },
}

function resolveActiveProviderId(): ProviderId {
  const env = process.env.PAYMENT_PROVIDER as ProviderId | undefined
  if (env && env in adapters) return env
  return 'mock'
}

export function getActiveProviderId(): ProviderId {
  return resolveActiveProviderId()
}

export function getAdapter(providerId: ProviderId): PaymentAdapter {
  return adapters[providerId] ?? mockAdapter
}

export function getProviderConfig(providerId: ProviderId): ProviderConfig {
  return configs[providerId] ?? configs.mock
}

export function getActiveAdapter(): { adapter: PaymentAdapter; config: ProviderConfig } {
  const id = resolveActiveProviderId()
  return { adapter: adapters[id], config: configs[id] }
}

export function getAdminSnapshot(): ProviderSnapshot {
  return {
    activeProvider: resolveActiveProviderId(),
    available: Object.keys(adapters) as ProviderId[],
    sandbox: configs[resolveActiveProviderId()]?.sandbox ?? true,
  }
}
