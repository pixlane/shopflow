import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/store";
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const allOrders = await getAllOrders();
  const orders = status ? allOrders.filter((o) => o.status === status) : allOrders;
  return NextResponse.json({ data: orders, total: orders.length });
}