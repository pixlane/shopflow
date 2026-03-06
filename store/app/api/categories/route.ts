import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/store";

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({ data: categories, total: categories.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const category = createCategory({
      name: body.name,
      slug,
      description: body.description ?? "",
      image: body.image,
      sortOrder: body.sortOrder ?? 99,
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
