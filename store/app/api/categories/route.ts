import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/store";
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ data: categories, total: categories.length });
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await createCategory(body);
    if (!category) return NextResponse.json({ error: "Failed to create category" }, { status: 400 });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}