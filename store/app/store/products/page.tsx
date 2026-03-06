import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/store";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";

export const dynamic = "force-dynamic";

interface SearchParams { category?: string; sort?: string; q?: string; }

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const allProducts = getProducts({ published: true });
  const categories = getCategories();

  let filtered = [...allProducts];
  if (searchParams.category)
    filtered = filtered.filter((p) => p.category.slug === searchParams.category);
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
    );
  }
  switch (searchParams.sort) {
    case "price-asc": filtered.sort((a, b) => a.price - b.price); break;
    case "price-desc": filtered.sort((a, b) => b.price - a.price); break;
    case "newest": filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight">{activeCategory ? activeCategory.name : "All Products"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>
      </div>
      <div className="flex flex-col gap-6">
        <Suspense>
          <ProductFilters categories={categories} activeCategory={searchParams.category} activeSort={searchParams.sort} />
        </Suspense>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-sm">No products found. <a href="/store/products" className="underline">Clear filters</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
