import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const products = getProducts({
    categorySlug: searchParams.get("category") ?? undefined,
    published: searchParams.has("published")
      ? searchParams.get("published") === "true"
      : undefined,
    featured: searchParams.has("featured")
      ? searchParams.get("featured") === "true"
      : undefined,
    q: searchParams.get("q") ?? undefined,
  });
  return NextResponse.json({ data: products, total: products.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = createProduct(body);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
