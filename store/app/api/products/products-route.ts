import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const products = await getProducts({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.has("featured")
      ? searchParams.get("featured") === "true"
      : undefined,
  });

  // client-side q filter (search)
  const q = searchParams.get("q")?.toLowerCase();
  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      )
    : products;

  return NextResponse.json({ data: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await createProduct(body);
    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 400 });
    }
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
