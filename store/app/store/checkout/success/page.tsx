import Link from "next/link";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-tight">Order placed!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for your purchase. We&apos;ll send a confirmation to your email shortly.
          </p>
          {searchParams.orderId && (
            <p className="text-xs text-muted-foreground font-mono mt-3">
              Order ID: {searchParams.orderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/store/products"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Continue shopping <ArrowRight size={14} />
          </Link>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md border border-border text-sm hover:bg-secondary transition-colors"
          >
            <ShoppingBag size={14} /> Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
