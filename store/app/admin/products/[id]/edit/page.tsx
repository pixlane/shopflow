import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductById, getCategories } from "@/lib/store";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors">
          <ChevronLeft size={15} />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Edit Product</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{product.name}</p>
        </div>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}