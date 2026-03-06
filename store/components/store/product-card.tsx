"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/store/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        <Image
          src={product.images[imgIdx] || product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Hover second image */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alternate`}
            fill
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.comparePrice && (
            <span className="inline-flex items-center rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium text-background">
              Sale
            </span>
          )}
          {product.stock <= 4 && product.stock > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-medium text-white">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Sold out
            </span>
          )}
        </div>

        {/* Quick add */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || added}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-background/95 backdrop-blur text-xs font-medium text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <ShoppingBag size={13} />
            {added ? "Added" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-[11px] text-muted-foreground tracking-wide uppercase">
          {product.category.name}
        </p>
        <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
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
