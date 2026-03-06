import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProducts, getProductBySlug } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/store" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/store/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight size={12} />
        <Link href={`/store/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium truncate max-w-[140px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-foreground text-background text-[11px] font-semibold px-2.5 py-1 rounded-full">
                −{discount}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary border-2 border-transparent hover:border-foreground/30 cursor-pointer transition-colors">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="15vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/store/products?category=${product.category.slug}`} className="text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              {product.category.name}
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">{product.sku}</span>
          </div>

          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            {product.stock > 4 ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />In stock
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />Only {product.stock} remaining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />Out of stock
              </span>
            )}
          </div>

          <AddToCartButton product={product} />

          <div className="h-px bg-border my-8" />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest uppercase">About this piece</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.longDescription}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="h-6 px-2.5 inline-flex items-center rounded-full border border-border text-[11px] text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-lg bg-secondary px-4 py-3">
            <p className="text-xs text-muted-foreground">Free shipping on orders over $150 · Usually ships in 3–5 business days</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-light tracking-tight mb-8">More from {product.category.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
