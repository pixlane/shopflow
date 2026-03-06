import { NextRequest, NextResponse } from "next/server";
import { getAdapter, getProviderConfig } from "@/lib/payment";
import type { ProviderId } from "@/lib/payment";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const providerId = req.nextUrl.searchParams.get("provider") as ProviderId | null;
  if (!providerId) {
    return NextResponse.json({ error: "provider query param required" }, { status: 400 });
  }

  try {
    const adapter = getAdapter(providerId);
    const config = getProviderConfig(providerId);
    const result = await adapter.getPaymentStatus(params.sessionId, config);
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status query failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
