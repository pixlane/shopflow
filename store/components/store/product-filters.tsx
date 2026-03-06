"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
];

export function ProductFilters({
  categories,
  activeCategory,
  activeSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "featured") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => updateParam("category", null)}
          className={cn(
            "h-8 px-3.5 rounded-full text-xs font-medium transition-colors border",
            !activeCategory
              ? "bg-foreground text-background border-transparent"
              : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              updateParam(
                "category",
                activeCategory === cat.slug ? null : cat.slug
              )
            }
            className={cn(
              "h-8 px-3.5 rounded-full text-xs font-medium transition-colors border",
              activeCategory === cat.slug
                ? "bg-foreground text-background border-transparent"
                : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={activeSort || "featured"}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="h-8 text-xs border border-border rounded-md px-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
