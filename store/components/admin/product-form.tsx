"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ExternalLink } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { useToast } from "./toast";
import { slugify } from "@/lib/utils";
import type { Product, Category, ProductFormValues } from "@/types";

interface ProductFormProps {
  product?: Product;          // undefined = create mode
  categories: Category[];
}

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  price: "",
  comparePrice: "",
  categoryId: "",
  tags: "",
  stock: "",
  sku: "",
  weight: "",
  featured: false,
  published: true,
  images: [],
};

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const isEdit = !!product;

  const [values, setValues] = useState<ProductFormValues>(() =>
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          longDescription: product.longDescription,
          price: String(product.price),
          comparePrice: product.comparePrice ? String(product.comparePrice) : "",
          categoryId: product.category.id,
          tags: product.tags.join(", "),
          stock: String(product.stock),
          sku: product.sku,
          weight: product.weight ? String(product.weight) : "",
          featured: product.featured,
          published: product.published,
          images: product.images,
        }
      : { ...EMPTY, categoryId: categories[0]?.id ?? "" }
  );
  const [saving, setSaving] = useState(false);
  const [slugLocked, setSlugLocked] = useState(isEdit);

  const set = useCallback(
    <K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) =>
      setValues((v) => ({ ...v, [key]: val })),
    []
  );

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugLocked) set("slug", slugify(name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!values.name.trim()) return error("Product name is required");
    if (!values.price) return error("Price is required");
    if (!values.categoryId) return error("Category is required");
    if (!values.sku.trim()) return error("SKU is required");

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/products/${product!.id}`
        : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Basic info */}
          <Section title="Basic Information">
            <div className="space-y-4">
              <Field label="Product name *">
                <input
                  value={values.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Matte Ceramic Vase"
                  className={inputCls}
                />
              </Field>

              <Field
                label="Slug"
                hint={
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    {slugLocked ? "Edit" : "Lock"}
                  </button>
                }
              >
                <div className="flex rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <span className="px-2.5 flex items-center text-xs text-muted-foreground bg-secondary border-r border-input shrink-0">
                    /products/
                  </span>
                  <input
                    value={values.slug}
                    onChange={(e) => { setSlugLocked(true); set("slug", e.target.value); }}
                    className="flex-1 h-9 px-3 text-sm bg-background focus:outline-none"
                    placeholder="product-slug"
                  />
                </div>
              </Field>

              <Field label="Short description *">
                <textarea
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  placeholder="One-line summary shown in product cards."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Long description">
                <textarea
                  value={values.longDescription}
                  onChange={(e) => set("longDescription", e.target.value)}
                  rows={5}
                  placeholder="Full product details, materials, care instructions…"
                  className={`${inputCls} resize-y min-h-[100px]`}
                />
              </Field>
            </div>
          </Section>

          {/* Images */}
          <Section title="Images">
            <ImageUploader
              value={values.images}
              onChange={(imgs) => set("images", imgs)}
            />
          </Section>

          {/* Pricing */}
          <Section title="Pricing & Inventory">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Price (USD) *">
                <div className="flex rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <span className="px-2.5 flex items-center text-xs text-muted-foreground bg-secondary border-r border-input">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-9 px-3 text-sm bg-background focus:outline-none"
                  />
                </div>
              </Field>

              <Field label="Compare at price">
                <div className="flex rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <span className="px-2.5 flex items-center text-xs text-muted-foreground bg-secondary border-r border-input">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.comparePrice}
                    onChange={(e) => set("comparePrice", e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-9 px-3 text-sm bg-background focus:outline-none"
                  />
                </div>
              </Field>

              <Field label="SKU *">
                <input
                  value={values.sku}
                  onChange={(e) => set("sku", e.target.value.toUpperCase())}
                  placeholder="CER-VAZ-001"
                  className={`${inputCls} font-mono`}
                />
              </Field>

              <Field label="Stock quantity *">
                <input
                  type="number"
                  min="0"
                  value={values.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>

              <Field label="Weight (grams)">
                <input
                  type="number"
                  min="0"
                  value={values.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="e.g. 450"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Status */}
          <Section title="Status">
            <div className="space-y-3">
              <Toggle
                label="Published"
                hint="Visible in storefront"
                checked={values.published}
                onChange={(v) => set("published", v)}
              />
              <Toggle
                label="Featured"
                hint="Shown in homepage featured section"
                checked={values.featured}
                onChange={(v) => set("featured", v)}
              />
            </div>
          </Section>

          {/* Category */}
          <Section title="Category *">
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    values.categoryId === cat.id
                      ? "border-foreground bg-secondary"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={values.categoryId === cat.id}
                    onChange={() => set("categoryId", cat.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium flex-1">{cat.name}</span>
                  {values.categoryId === cat.id && (
                    <div className="h-4 w-4 rounded-full bg-foreground flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-background" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <Field hint="Comma-separated">
              <input
                value={values.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="handmade, ceramic, home decor"
                className={inputCls}
              />
            </Field>
            {values.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {values.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="h-5 px-2 inline-flex items-center rounded-full border border-border text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Preview link */}
          {isEdit && (
            <a
              href={`/store/products/${values.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={12} />
              Preview in storefront
            </a>
          )}
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-background/95 border-t border-border backdrop-blur flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {isEdit ? `Editing: ${product!.name}` : "Creating new product"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-medium flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {title && (
        <div className="px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {(label || hint) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-xs font-medium">{label}</label>}
          {hint && <span>{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <div>
        <p className="text-xs font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground";
