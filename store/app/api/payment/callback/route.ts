/**
 * POST /api/payment/callback?provider=stripe|iyzico|paytr|mock
 *
 * Called by the payment provider server-to-server (webhook) or by our own
 * checkout page after the embedded widget resolves.
 *
 * Responsibilities:
 *  1. Route to the correct adapter
 *  2. Parse + verify the payload
 *  3. Update order status in our store
 *  4. Return "OK" (PayTR) or JSON (others)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdapter, getProviderConfig } from "@/lib/payment";
import type { ProviderId } from "@/lib/payment";
import { updateOrderStatus, getOrderById } from "@/lib/store";

export async function POST(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("provider") as ProviderId | null;

  if (!providerId) {
    return NextResponse.json({ error: "provider query param required" }, { status: 400 });
  }

  try {
    const adapter = getAdapter(providerId);
    const config = getProviderConfig(providerId);

    // Parse body — PayTR sends form-encoded; others send JSON
    let payload: Record<string, unknown>;
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      payload = Object.fromEntries(new URLSearchParams(text).entries());
    } else {
      payload = await req.json().catch(() => ({}));
    }

    const result = await adapter.handleCallback(payload, config);

    // ── Update order in our store ────────────────────────────────────────

    if (result.orderId) {
      const order = getOrderById(result.orderId);
      if (order) {
        updateOrderStatus(result.orderId, {
          paymentStatus:
            result.status === "succeeded"
              ? "paid"
              : result.status === "refunded"
              ? "refunded"
              : "unpaid",
          status:
            result.status === "succeeded"
              ? "confirmed"
              : result.status === "failed"
              ? "cancelled"
              : order.status,
          notes: result.errorMessage
            ? `[Payment] ${result.errorMessage}`
            : undefined,
        });
      }
    }

    // PayTR expects plain-text "OK" response
    if (providerId === "paytr") {
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json({
      data: {
        status: result.status,
        orderId: result.orderId,
        sessionId: result.sessionId,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Callback processing failed";
    console.error("[payment/callback]", providerId, err);

    // PayTR must still get "OK" or it keeps retrying
    if (providerId === "paytr") {
      return new NextResponse("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Stripe also uses GET for webhook verification
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ status: "payment callback endpoint" });
}
