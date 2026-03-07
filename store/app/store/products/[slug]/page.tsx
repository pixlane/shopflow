import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { getProducts, getProductBySlug } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return { title: `${product.name} — Atelier`, description: product.description };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getProducts({ published: true })
    .filter((p) => p.id !== product.id && p.category.id === product.category.id)
    .slice(0, 4);

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Link href="/store" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={11} />
          <Link href="/store/products" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={11} />
          <Link href={`/store/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">{product.category.name}</Link>
          <ChevronRight size={11} />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-start">

          {/* Images */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-secondary" style={{ aspectRatio: "4/5" }}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              {discount && (
                <div className="absolute top-4 left-4 rounded-sm px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: "hsl(220, 35%, 14%)" }}>
                  -{discount}%
                </div>
              )}
            </div>
            {product.images.slice(1, 3).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {product.images.slice(1, 3).map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                    <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="30vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Category + name */}
            <div>
              <Link
                href={`/store/products?category=${product.category.slug}`}
                className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans"
              >
                {product.category.name}
              </Link>
              <h1 className="font-display text-3xl lg:text-4xl font-normal mt-2 leading-tight">{product.name}</h1>

              {/* Rating mock */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[12px] text-muted-foreground">4.9 (23 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-medium">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discount && (
                <span className="text-sm font-medium text-amber-600">Save {discount}%</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed font-light border-t border-border pt-6">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${product.stock > 5 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-400"}`} />
              <span className="text-xs text-muted-foreground font-sans">
                {product.stock > 5 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
              </span>
            </div>

            {/* Add to cart */}
            <AddToCartButton product={product} />

            {/* Specs */}
            {(product.sku || product.weight) && (
              <div className="border-t border-border pt-6 space-y-2.5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans mb-3">Details</p>
                {product.sku && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium font-mono">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Weight</span>
                    <span>{product.weight}g</span>
                  </div>
                )}
                {product.tags?.length > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tags</span>
                    <span>{product.tags.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Shipping info */}
            <div className="border-t border-border pt-6 space-y-3">
              {[
                { icon: Truck, title: "Free shipping", desc: "On orders over $150" },
                { icon: RotateCcw, title: "30-day returns", desc: "Easy and hassle-free" },
                { icon: ShieldCheck, title: "Certified authentic", desc: "Verified by artisans" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-sm bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{title}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-24 pt-12 border-t border-border">
            <div className="mb-8">
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">More from</p>
              <h2 className="font-display text-2xl lg:text-3xl font-normal">{product.category.name}</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
