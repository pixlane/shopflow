"use client";

import { useWishlistStore } from "@/hooks/use-wishlist";
import { useCartStore } from "@/hooks/use-cart";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-cream)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart size={18} style={{ color: "var(--gold)" }} />
            <p className="text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--gold)" }}>Saved Items</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-light mb-2" style={{ color: "var(--body-text)" }}>My Wishlist</h1>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "piece" : "pieces"} saved</p>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center border border-dashed" style={{ borderColor: "var(--gold)" }}>
              <Heart size={28} style={{ color: "var(--gold)" }} />
            </div>
            <h2 className="text-xl font-light mb-3" style={{ color: "var(--body-text)" }}>Your wishlist is empty</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">Browse our collection and save pieces you love for later.</p>
            <Link href="/store/products" className="atelier-btn-gold inline-flex items-center gap-2 px-8 py-3 text-[13px] font-semibold tracking-[0.1em] uppercase border transition-all duration-300">Explore Collection</Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-8">
              <button onClick={() => items.forEach((p) => addToCart(p))} className="inline-flex items-center gap-2 px-6 py-2.5 text-[12px] font-semibold tracking-widest uppercase text-white" style={{ backgroundColor: "var(--gold)" }}>
                <ShoppingBag size={14} />
                Add All to Cart
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
