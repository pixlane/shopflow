import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductById, getCategories } from "@/lib/store";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [dbProduct, categories] = await Promise.all([
    getProductById(params.id),
    getCategories(),
  ]);

  if (!dbProduct) notFound();

  const p = dbProduct as any;
  const product: Product = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    longDescription: p.long_description ?? "",
    price: p.price,
    comparePrice: p.compare_price ?? undefined,
    images: p.images ?? [],
    category: {
      id: p.categories?.id ?? p.category_id ?? "",
      name: p.categories?.name ?? "",
      slug: p.categories?.slug ?? "",
      sortOrder: p.categories?.sort_order ?? 0,
      createdAt: p.categories?.created_at ?? "",
      updatedAt: p.categories?.updated_at ?? "",
    },
    tags: Array.isArray(p.tags) ? p.tags : [],
    stock: p.stock,
    sku: p.sku ?? "",
    weight: p.weight ?? undefined,
    featured: p.is_featured ?? false,
    published: p.is_published ?? (p.stock > 0),
    createdAt: p.created_at ?? "",
    updatedAt: p.updated_at ?? "",
  };

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
      <ProductForm product={product} categories={categories as any} />
    </div>
  );
}
