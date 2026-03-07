import { getProducts } from "@/lib/store";
import { ProductsClient } from "@/components/admin/products-client";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const dbProducts = await getProducts();

  const products: Product[] = (dbProducts as any[]).map((p) => ({
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
  }));

  return <ProductsClient initialProducts={products} />;
}
