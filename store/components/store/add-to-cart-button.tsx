"use client";

import { useState } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import type { Product } from "@/types";
import Link from "next/link";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full h-12 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-16">Quantity</span>
        <div className="flex items-center border border-border rounded-md">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus size={13} />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="w-full h-12 rounded-md bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 active:scale-[0.98] transition-all"
      >
        {added ? (
          <>
            <Check size={16} />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            Add to cart
          </>
        )}
      </button>

      {/* View cart link */}
      {added && (
        <Link
          href="/store/cart"
          className="block w-full h-10 rounded-md border border-border text-sm font-medium flex items-center justify-center hover:bg-secondary transition-colors"
        >
          View cart →
        </Link>
      )}
    </div>
  );
}
