import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/store";
import type { OrderStatus } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") as OrderStatus | null;
  const orders = getOrders(status ? { status } : undefined);
  return NextResponse.json({ data: orders, total: orders.length });
}
