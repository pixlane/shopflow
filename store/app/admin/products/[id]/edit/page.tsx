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

  const product: Product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description ?? "",
    longDescription: (dbProduct as any).long_description ?? "",
    price: dbProduct.price,
    comparePrice: dbProduct.compare_price ?? undefined,
    images: dbProduct.images ?? [],
    category: {
      id: dbProduct.category_id ?? (dbProduct as any).categories?.id ?? "",
      name: (dbProduct as any).categories?.name ?? "",
      slug: (dbProduct as any).categories?.slug ?? "",
      sortOrder: (dbProduct as any).categories?.sort_order ?? 0,
      createdAt: (dbProduct as any).categories?.created_at ?? "",
      updatedAt: (dbProduct as any).categories?.updated_at ?? "",
    },
    tags: Array.isArray(dbProduct.tags) ? dbProduct.tags : [],
    stock: dbProduct.stock,
    sku: (dbProduct as any).sku ?? "",
    weight: dbProduct.weight ?? undefined,
    featured: dbProduct.is_featured ?? false,
    published: (dbProduct as any).is_published ?? (dbProduct.stock > 0),
    createdAt: dbProduct.created_at ?? "",
    updatedAt: dbProduct.updated_at ?? "",
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
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
