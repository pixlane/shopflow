import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/store";
import { ProductCard } from "@/components/store/product-card";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; sort?: string };
}) {
  const allProducts = getProducts({ published: true });
  const categories = getCategories();

  let filtered: Product[] = allProducts;
  if (searchParams.category) {
    filtered = filtered.filter((p) => p.category.slug === searchParams.category);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }
  if (searchParams.sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (searchParams.sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">
          {activeCategory ? activeCategory.name : "The collection"}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-normal">
          {activeCategory ? activeCategory.name : "All pieces"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* Sidebar filters */}
        <aside className="lg:w-48 shrink-0">
          <div className="space-y-6 sticky top-24">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">Category</p>
              <div className="space-y-1">
                <a
                  href="/store/products"
                  className={`flex items-center justify-between py-1.5 text-sm transition-colors ${!searchParams.category ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span>All pieces</span>
                  <span className="text-[11px] text-muted-foreground">{allProducts.length}</span>
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/store/products?category=${cat.slug}${searchParams.sort ? `&sort=${searchParams.sort}` : ""}`}
                    className={`flex items-center justify-between py-1.5 text-sm transition-colors ${searchParams.category === cat.slug ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-muted-foreground">{cat.productCount}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans">Sort by</p>
              <div className="space-y-1">
                {[
                  { label: "Featured", value: "" },
                  { label: "Price: low to high", value: "price-asc" },
                  { label: "Price: high to low", value: "price-desc" },
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`/store/products?${searchParams.category ? `category=${searchParams.category}&` : ""}sort=${opt.value}`}
                    className={`block py-1.5 text-sm transition-colors ${(searchParams.sort ?? "") === opt.value ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground font-sans">{filtered.length} piece{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <p className="font-display text-2xl text-muted-foreground/40">No pieces found</p>
              <a href="/store/products" className="inline-block text-sm text-muted-foreground hover:text-foreground underline">
                Clear filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
