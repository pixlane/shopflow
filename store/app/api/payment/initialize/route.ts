/**
 * POST /api/payment/initialize
 *
 * Body: {
 *   orderId: string
 *   cartItems: CartItem[]
 *   customer: { name, email, phone?, address }
 *   callbackUrl?: string   // defaults to /store/checkout/success
 *   cancelUrl?:   string   // defaults to /store/cart
 * }
 *
 * Response: PaymentSession (clientToken / formToken / redirectUrl)
 */

import { NextRequest, NextResponse } from "next/server";
import { getActiveAdapter, getActiveProviderId } from "@/lib/payment";
import type {
  InitializePaymentRequest,
  PaymentBuyer,
  PaymentAddress,
  PaymentBasketItem,
  Money,
} from "@/lib/payment";
import { getOrderById } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { orderId, cartItems, customer, callbackUrl, cancelUrl } = body as {
      orderId?: string;
      cartItems?: Array<{
        product: { id: string; name: string; price: number; category: { name: string }; sku: string };
        quantity: number;
      }>;
      customer?: {
        name: string;
        email: string;
        phone?: string;
        address: { line1: string; city: string; postalCode?: string; country: string };
      };
      callbackUrl?: string;
      cancelUrl?: string;
    };

    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
    if (!cartItems?.length) return NextResponse.json({ error: "cartItems required" }, { status: 400 });
    if (!customer?.email) return NextResponse.json({ error: "customer.email required" }, { status: 400 });

    // ── Build canonical request ───────────────────────────────────────────

    const [firstName, ...rest] = (customer.name ?? "Guest").split(" ");
    const lastName = rest.join(" ") || firstName;

    // Forward client IP (use x-forwarded-for in prod behind a proxy)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";

    const buyer: PaymentBuyer = {
      id: customer.email,
      name: firstName,
      surname: lastName,
      email: customer.email,
      phone: customer.phone,
      ip,
      identityNumber: "11111111111", // placeholder; TR providers may require real TC/passport
    };

    const addr: PaymentAddress = {
      contactName: customer.name,
      city: customer.address?.city ?? "Istanbul",
      country: customer.address?.country ?? "TR",
      address: customer.address?.line1 ?? "",
      zipCode: customer.address?.postalCode,
    };

    const basketItems: PaymentBasketItem[] = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      category: item.product.category?.name ?? "General",
      price: Math.round(item.product.price * 100), // cents/kuruş
      quantity: item.quantity,
      itemType: "PHYSICAL",
    }));

    const subtotal = cartItems.reduce(
      (s, i) => s + Math.round(i.product.price * 100) * i.quantity,
      0
    );
    const shipping = subtotal >= 15000 ? 0 : 1500; // $15 shipping under $150
    const totalAmount = subtotal + shipping;

    const { adapter, config } = getActiveAdapter();

    // Validate config before proceeding
    const validationError = adapter.validateConfig(config);
    if (validationError) {
      return NextResponse.json({ error: `Payment config error: ${validationError}` }, { status: 422 });
    }

    const origin = req.nextUrl.origin;
    const paymentRequest: InitializePaymentRequest = {
      orderId,
      amount: { amount: totalAmount, currency: "USD" } satisfies Money,
      buyer,
      shippingAddress: addr,
      billingAddress: addr,
      basketItems,
      callbackUrl: callbackUrl ?? `${origin}/api/payment/callback?provider=${config.providerId}`,
      cancelUrl: cancelUrl ?? `${origin}/store/cart`,
      idempotencyKey: `${orderId}-${getActiveProviderId()}`,
      metadata: { orderId, source: "storefront" },
    };

    const session = await adapter.initializePayment(paymentRequest, config);

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment initialization failed";
    console.error("[payment/initialize]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
