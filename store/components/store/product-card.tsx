"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { useWishlistStore } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, hasItem } = useWishlistStore();
  const [added, setAdded] = useState(false);

  const wishlisted = hasItem(product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product);
  }

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <Link href={`/store/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f5f0eb] aspect-square">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={`${product.name} alt`}
            fill
            className="object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        )}

        {/* Top-left badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && discount > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide rounded-full" style={{ backgroundColor: "var(--red-sale)" }}>
              {discount}% Off
            </span>
          )}
          {product.stock <= 0 && (
            <span className="px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide rounded-full bg-gray-500">
              Sold Out
            </span>
          )}
          {product.is_featured && product.stock > 0 && !discount && (
            <span className="px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide rounded-full" style={{ backgroundColor: "#2d7a4f" }}>
              Hot Sale
            </span>
          )}
        </div>

        {/* Top-right category tag */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide bg-white/90 rounded-full" style={{ color: "var(--body-text)" }}>
            {product.categories?.name ?? ""}
          </span>
        </div>

        {/* Right side action buttons — appear on hover */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="h-9 w-9 rounded-full shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50"
            style={{ backgroundColor: added ? "var(--gold)" : "white" }}
            title="Add to cart"
          >
            <ShoppingBag size={14} style={{ color: added ? "white" : "var(--body-text)" }} />
          </button>
          <button
            onClick={handleWishlist}
            className="h-9 w-9 rounded-full shadow-md flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: wishlisted ? "#e13939" : "white" }}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={14}
              fill={wishlisted ? "white" : "none"}
              style={{ color: wishlisted ? "white" : "var(--body-text)" }}
            />
          </button>
          <Link
            href={`/store/products/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200"
            style={{}}
            title="View product"
          >
            <Eye size={14} style={{ color: "var(--body-text)" }} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-center space-y-1.5">
        <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">{product.categories?.name ?? ""}</p>
        <h3 className="text-[15px] font-medium leading-snug group-hover:text-[var(--gold)] transition-colors" style={{ color: "var(--body-text)" }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= 4 ? "#bb976d" : "none"} stroke="#bb976d" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">(128)</span>
        </div>
        <div className="flex items-center justify-center gap-3 pt-0.5">
          <span className="text-base font-semibold" style={{ color: "var(--gold)" }}>{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
