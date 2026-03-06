"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, shipping, total } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-6">
          <ShoppingBag size={24} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-light tracking-tight mb-3">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Discover handcrafted objects made to last.
        </p>
        <Link
          href="/store/products"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <ArrowLeft size={15} />
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-light tracking-tight">
          Cart{" "}
          <span className="text-muted-foreground text-lg">
            ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
        </h1>
        <Link
          href="/store/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Continue shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Line items */}
        <div className="space-y-0 divide-y divide-border">
          {items.map((item) => (
            <div key={item.product.id} className="py-6 flex gap-5">
              {/* Image */}
              <Link
                href={`/store/products/${item.product.slug}`}
                className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-secondary"
              >
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      {item.product.category.name}
                    </p>
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="text-sm font-medium hover:text-muted-foreground transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {item.product.sku}
                    </p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {formatPrice(item.product.price)} ea.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold tracking-wide">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping() === 0 ? (
                    <span className="text-emerald-700">Free</span>
                  ) : (
                    formatPrice(shipping())
                  )}
                </span>
              </div>
              {shipping() > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Add {formatPrice(150 - subtotal())} more for free shipping
                </p>
              )}
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(total())}</span>
            </div>

            {/* Promo code */}
            <div className="flex gap-2">
              <input
                placeholder="Promo code"
                className="flex-1 h-9 px-3 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="h-9 px-3 text-xs rounded-md border border-border hover:bg-secondary transition-colors">
                Apply
              </button>
            </div>

            {/* Checkout CTA */}
            <a
              href="/store/checkout"
              className="w-full h-12 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </a>

            <p className="text-[11px] text-center text-muted-foreground">
              Secure checkout · 30-day returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
