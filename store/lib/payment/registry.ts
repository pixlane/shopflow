/**
 * lib/payment/registry.ts
 *
 * Central registry for payment adapters.
 * - Holds all adapter instances (keyed by ProviderId)
 * - Stores per-provider config in the in-memory store (same singleton as lib/store.ts)
 * - `getActiveAdapter()` returns the currently selected adapter + its config
 */

import type { PaymentAdapter, ProviderConfig, ProviderId } from "./types";
import { MockAdapter } from "./adapters/mock";
import { StripeAdapter } from "./adapters/stripe";
import { IyzicoAdapter } from "./adapters/iyzico";
import { PayTRAdapter } from "./adapters/paytr";

// ─── All registered adapters ──────────────────────────────────────────────────

export const ADAPTERS: Record<ProviderId, PaymentAdapter> = {
  mock: MockAdapter,
  stripe: StripeAdapter,
  iyzico: IyzicoAdapter,
  paytr: PayTRAdapter,
};

// ─── Default configs per provider (no real secrets here) ─────────────────────

const DEFAULT_CONFIGS: Record<ProviderId, ProviderConfig> = {
  mock: {
    providerId: "mock",
    enabled: true,
    label: "Mock / Test",
    credentials: {},
    mode: "test",
    options: { autoSucceed: true, delayMs: 700 },
  },
  stripe: {
    providerId: "stripe",
    enabled: false,
    label: "Stripe",
    credentials: { secretKey: "", publishableKey: "", webhookSecret: "" },
    mode: "test",
    options: { captureMethod: "automatic" },
  },
  iyzico: {
    providerId: "iyzico",
    enabled: false,
    label: "Iyzico",
    credentials: {
      apiKey: "",
      secretKey: "",
      baseUrl: "https://sandbox-api.iyzipay.com",
    },
    mode: "test",
    options: { installments: "12", locale: "tr" },
  },
  paytr: {
    providerId: "paytr",
    enabled: false,
    label: "PayTR",
    credentials: { merchantId: "", merchantKey: "", merchantSalt: "" },
    mode: "test",
    options: { maxInstallment: "6", noInstallment: false, lang: "tr" },
  },
};

// ─── In-process config store (replaces DB in this demo) ───────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __paymentRegistry: PaymentRegistryState | undefined;
}

interface PaymentRegistryState {
  activeProviderId: ProviderId;
  configs: Record<ProviderId, ProviderConfig>;
}

function getRegistryState(): PaymentRegistryState {
  if (!global.__paymentRegistry) {
    global.__paymentRegistry = {
      activeProviderId: "mock",
      configs: structuredClone(DEFAULT_CONFIGS),
    };
  }
  return global.__paymentRegistry;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** All provider IDs in display order */
export const ALL_PROVIDER_IDS: ProviderId[] = ["mock", "stripe", "iyzico", "paytr"];

/** Get the active provider ID */
export function getActiveProviderId(): ProviderId {
  return getRegistryState().activeProviderId;
}

/** Set the active provider (persists in-process) */
export function setActiveProvider(id: ProviderId): void {
  const s = getRegistryState();
  if (!ADAPTERS[id]) throw new Error(`Unknown provider: ${id}`);
  s.activeProviderId = id;
}

/** Get config for a specific provider */
export function getProviderConfig(id: ProviderId): ProviderConfig {
  return getRegistryState().configs[id] ?? DEFAULT_CONFIGS[id];
}

/** Update config for a specific provider (merges credentials + options) */
export function updateProviderConfig(
  id: ProviderId,
  patch: Partial<Omit<ProviderConfig, "providerId">>
): ProviderConfig {
  const s = getRegistryState();
  const current = s.configs[id] ?? DEFAULT_CONFIGS[id];
  s.configs[id] = {
    ...current,
    ...patch,
    credentials: { ...current.credentials, ...(patch.credentials ?? {}) },
    options: { ...current.options, ...(patch.options ?? {}) },
    providerId: id, // immutable
  };
  return s.configs[id];
}

/** Get the active adapter + its config (the main entry point for payment flows) */
export function getActiveAdapter(): {
  adapter: PaymentAdapter;
  config: ProviderConfig;
} {
  const s = getRegistryState();
  const id = s.activeProviderId;
  return {
    adapter: ADAPTERS[id],
    config: s.configs[id],
  };
}

/** Get adapter by ID (without activating it) */
export function getAdapter(id: ProviderId): PaymentAdapter {
  return ADAPTERS[id];
}

/**
 * Sanitized snapshot for the admin UI.
 * Strips secret credential values — replaces with "••••••" if set.
 */
export function getAdminSnapshot(): {
  activeProviderId: ProviderId;
  providers: Array<{
    id: ProviderId;
    meta: PaymentAdapter["meta"];
    config: ProviderConfig;
    configFields: PaymentAdapter["configFields"];
    validationError: string | null;
  }>;
} {
  const s = getRegistryState();

  const providers = ALL_PROVIDER_IDS.map((id) => {
    const adapter = ADAPTERS[id];
    const config = s.configs[id];

    // Mask secret fields
    const safeConfig: ProviderConfig = {
      ...config,
      credentials: Object.fromEntries(
        Object.entries(config.credentials).map(([k, v]) => {
          const field = adapter.configFields.find((f) => f.key === k);
          return [k, field?.secret && v ? "••••••" : v];
        })
      ),
    };

    return {
      id,
      meta: adapter.meta,
      config: safeConfig,
      configFields: adapter.configFields,
      validationError: adapter.validateConfig(config),
    };
  });

  return { activeProviderId: s.activeProviderId, providers };
}
