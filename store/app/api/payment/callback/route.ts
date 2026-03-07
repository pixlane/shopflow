import { NextRequest, NextResponse } from "next/server";
import { getAdapter, getProviderConfig } from "@/lib/payment";
import type { ProviderId } from "@/lib/payment";
import { updateOrderStatus, getOrderById } from "@/lib/store";
export async function POST(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("provider") as ProviderId | null;
  if (!providerId) return NextResponse.json({ error: "provider query param required" }, { status: 400 });
  try {
    const adapter = getAdapter(providerId);
    const config = getProviderConfig(providerId);
    let payload: Record<string, unknown>;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      payload = Object.fromEntries(new URLSearchParams(text).entries());
    } else {
      payload = await req.json().catch(() => ({}));
    }
    const result = await adapter.handleCallback(payload, config);
    if (result.orderId) {
      const order = await getOrderById(result.orderId);
      if (order) {
        await updateOrderStatus(result.orderId, result.status === "succeeded" ? "confirmed" : result.status === "failed" ? "cancelled" : order.status);
      }
    }
    if (providerId === "paytr") return new NextResponse("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
    return NextResponse.json({ data: { status: result.status, orderId: result.orderId, sessionId: result.sessionId } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Callback processing failed";
    console.error("[payment/callback]", providerId, err);
    if (providerId === "paytr") return new NextResponse("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ status: "payment callback endpoint" });
}