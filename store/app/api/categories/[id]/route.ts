import { NextRequest, NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/store";
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const cat = await getCategoryById(params.id);
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: cat });
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const cat = await updateCategory(params.id, body);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: cat });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteCategory(params.id);
  if (!ok) return NextResponse.json({ error: "Cannot delete — category has products, or not found." }, { status: 409 });
  return NextResponse.json({ data: { deleted: true } });
}