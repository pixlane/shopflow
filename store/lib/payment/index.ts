/**
 * lib/payment/index.ts
 *
 * Public API surface for the payment subsystem.
 * Import from "@/lib/payment" everywhere outside this folder.
 */

export type {
  ProviderId,
  ProviderMeta,
  ProviderConfig,
  ConfigField,
  Money,
  PaymentSession,
  PaymentSessionStatus,
  PaymentResult,
  PaymentResultStatus,
  PaymentBuyer,
  PaymentAddress,
  PaymentBasketItem,
  InitializePaymentRequest,
  RefundRequest,
  RefundResult,
  PaymentAdapter,
} from "./types";

export {
  ADAPTERS,
  ALL_PROVIDER_IDS,
  getActiveProviderId,
  setActiveProvider,
  getProviderConfig,
  updateProviderConfig,
  getActiveAdapter,
  getAdapter,
  getAdminSnapshot,
} from "./registry";
