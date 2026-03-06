import { NextResponse } from "next/server";
import { getAdminSnapshot } from "@/lib/payment";

export async function GET() {
  const snapshot = getAdminSnapshot();
  return NextResponse.json({ data: snapshot });
}
