"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
  Package,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoriesClientProps {
  initialCategories: Category[];
}

interface EditRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const { success, error } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [editRow, setEditRow] = useState<EditRow | null>(null);
  const [newRow, setNewRow] = useState<Omit<EditRow, "id"> | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Create ───────────────────────────────────────────────────────────────
  async function saveNew() {
    if (!newRow?.name.trim()) return error("Name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRow.name,
          slug: newRow.slug || slugify(newRow.name),
          description: newRow.description,
          sortOrder: parseInt(newRow.sortOrder) || 99,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) => [...prev, data.data]);
      setNewRow(null);
      success("Category created");
    } catch (e) {
      error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────
  async function saveEdit() {
    if (!editRow || !editRow.name.trim()) return error("Name is required");
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${editRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editRow.name,
          slug: editRow.slug || slugify(editRow.name),
          description: editRow.description,
          sortOrder: parseInt(editRow.sortOrder) || 99,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) =>
        prev.map((c) => (c.id === editRow.id ? data.data : c))
      );
      setEditRow(null);
      success("Category updated");
    } catch (e) {
      error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${toDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id));
      success("Category deleted");
    } catch (e) {
      error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const THEAD = ["", "Name", "Slug", "Description", "Products", "Order", ""];

  return (
    <>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Categories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {categories.length} categories
            </p>
          </div>
          <button
            disabled={!!newRow}
            onClick={() =>
              setNewRow({ name: "", slug: "", description: "", sortOrder: "99" })
            }
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {THEAD.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* New row */}
                {newRow && (
                  <tr className="bg-secondary/30">
                    <td className="px-4 py-3">
                      <GripVertical size={13} className="text-muted-foreground/30" />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        autoFocus
                        value={newRow.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setNewRow((r) =>
                            r
                              ? { ...r, name, slug: slugify(name) }
                              : r
                          );
                        }}
                        placeholder="Category name"
                        className={inCls}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={newRow.slug}
                        onChange={(e) =>
                          setNewRow((r) => r ? { ...r, slug: e.target.value } : r)
                        }
                        placeholder="slug"
                        className={`${inCls} font-mono text-[11px]`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={newRow.description}
                        onChange={(e) =>
                          setNewRow((r) => r ? { ...r, description: e.target.value } : r)
                        }
                        placeholder="Optional description"
                        className={inCls}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">—</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        value={newRow.sortOrder}
                        onChange={(e) =>
                          setNewRow((r) => r ? { ...r, sortOrder: e.target.value } : r)
                        }
                        className={`${inCls} w-16`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={saveNew}
                          disabled={saving}
                          className="h-7 w-7 flex items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setNewRow(null)}
                          className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Existing rows */}
                {categories.map((cat) => {
                  const isEditing = editRow?.id === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <GripVertical size={13} className="text-muted-foreground/40 cursor-grab" />
                      </td>

                      {isEditing ? (
                        <>
                          <td className="px-4 py-2.5">
                            <input
                              autoFocus
                              value={editRow.name}
                              onChange={(e) =>
                                setEditRow((r) => r ? { ...r, name: e.target.value } : r)
                              }
                              className={inCls}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              value={editRow.slug}
                              onChange={(e) =>
                                setEditRow((r) => r ? { ...r, slug: e.target.value } : r)
                              }
                              className={`${inCls} font-mono text-[11px]`}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              value={editRow.description}
                              onChange={(e) =>
                                setEditRow((r) => r ? { ...r, description: e.target.value } : r)
                              }
                              className={inCls}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package size={11} />
                              {cat.productCount ?? 0}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              value={editRow.sortOrder}
                              onChange={(e) =>
                                setEditRow((r) => r ? { ...r, sortOrder: e.target.value } : r)
                              }
                              className={`${inCls} w-16`}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="h-7 w-7 flex items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => setEditRow(null)}
                                className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-xs font-medium">{cat.name}</td>
                          <td className="px-4 py-3 text-[11px] text-muted-foreground font-mono">
                            {cat.slug}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                            {cat.description || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package size={11} />
                              {cat.productCount ?? 0}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {cat.sortOrder}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setEditRow({
                                    id: cat.id,
                                    name: cat.name,
                                    slug: cat.slug,
                                    description: cat.description ?? "",
                                    sortOrder: String(cat.sortOrder),
                                  })
                                }
                                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                disabled={(cat.productCount ?? 0) > 0}
                                onClick={() => setToDelete(cat)}
                                title={
                                  (cat.productCount ?? 0) > 0
                                    ? "Remove all products first"
                                    : "Delete"
                                }
                                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && !newRow && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No categories yet. Click &quot;Add Category&quot; to get started.
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Categories with products cannot be deleted. Reassign or delete products first.
        </p>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete category"
        description={`"${toDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}

const inCls =
  "w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring";
