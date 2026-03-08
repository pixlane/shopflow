"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import type { ProductWithCategory } from "@/types";

interface ProductsClientProps {
  initialProducts: ProductWithCategory[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toDelete, setToDelete] = useState<ProductWithCategory | null>(null);
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.categories?.slug === categoryFilter;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(products.map((p) => p.categories?.slug).filter(Boolean)));

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((ps) => ps.filter((p) => p.id !== toDelete.id));
      success(`"${toDelete.name}" deleted`);
    } catch (e) {
      error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Products</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{products.length} total · {filtered.length} shown</p>
          </div>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors">
            <Plus size={14} /> Add Product
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name…" className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-8 text-xs border border-border rounded-md px-2.5 bg-background text-foreground focus:outline-none">
              <option value="all">All categories</option>
              {categories.map((s) => (
                <option key={s} value={s!}>{s!.charAt(0).toUpperCase() + s!.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Product", "Category", "Price", "Stock", "Status", "Updated", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden bg-secondary shrink-0 border border-border">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium leading-tight">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[180px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{product.categories?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                      {formatPrice(product.price)}
                      {product.compare_price && (
                        <span className="text-muted-foreground line-through ml-1.5 text-[11px]">{formatPrice(product.compare_price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${product.stock <= 2 ? "text-red-600" : product.stock <= 6 ? "text-amber-600" : "text-emerald-700"}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${product.stock > 0 ? "text-emerald-700" : "text-muted-foreground"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                        {product.is_featured && <span className="text-[10px] text-amber-600 font-medium">★ Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(product.updated_at ?? product.created_at ?? "")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/store/products/${product.slug}`} target="_blank" className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Preview">
                          <Eye size={13} />
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                          <Pencil size={13} />
                        </Link>
                        <button onClick={() => setToDelete(product)} className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-12 text-center text-xs text-muted-foreground">No products match your filters.</div>}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 && "s"}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product"
        description={`"${toDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
