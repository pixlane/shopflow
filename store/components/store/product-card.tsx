"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <Link href={`/store/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-lg bg-secondary" style={{ aspectRatio: "3/4" }}>
        {/* Primary image */}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Secondary image on hover */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate`}
            fill
            className="object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && discount > 0 && (
            <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: "hsl(220, 35%, 14%)" }}>
              -{discount}%
            </span>
          )}
          {product.stock <= 4 && product.stock > 0 && (
            <span className="inline-flex items-center rounded-sm bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white">
              {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center rounded-sm bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/80">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
        >
          <Heart size={13} className="text-foreground/70" />
        </button>

        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || added}
            style={added ? { backgroundColor: "hsl(220, 35%, 14%)", color: "white" } : {}}
            className="w-full flex items-center justify-center gap-2 h-10 bg-white/95 backdrop-blur text-[12px] font-medium text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-60 shadow-sm"
          >
            <ShoppingBag size={12} />
            {added ? "Added to cart ✓" : product.stock === 0 ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3.5 space-y-1">
        <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase font-sans">
          {product.category.name}
        </p>
        <h3 className="text-sm font-display font-normal text-foreground group-hover:text-foreground/75 transition-colors line-clamp-1 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm font-medium">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
