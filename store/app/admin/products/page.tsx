import { getProducts } from "@/lib/store";
import { ProductsClient } from "@/components/admin/products-client";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const dbProducts = await getProducts();

  const products: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    longDescription: (p as any).long_description ?? "",
    price: p.price,
    comparePrice: p.compare_price ?? undefined,
    images: p.images ?? [],
    category: {
      id: p.category_id ?? (p as any).categories?.id ?? "",
      name: (p as any).categories?.name ?? "",
      slug: (p as any).categories?.slug ?? "",
      sortOrder: (p as any).categories?.sort_order ?? 0,
      createdAt: (p as any).categories?.created_at ?? "",
      updatedAt: (p as any).categories?.updated_at ?? "",
    },
    tags: Array.isArray(p.tags) ? p.tags : [],
    stock: p.stock,
    sku: (p as any).sku ?? "",
    weight: p.weight ?? undefined,
    featured: p.is_featured ?? false,
    published: (p as any).is_published ?? (p.stock > 0),
    createdAt: p.created_at ?? "",
    updatedAt: p.updated_at ?? "",
  }));

  return <ProductsClient initialProducts={products} />;
}
