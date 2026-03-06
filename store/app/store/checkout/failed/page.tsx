import Link from "next/link";
import { XCircle, RefreshCcw, ShoppingBag } from "lucide-react";

export default function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle size={40} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-tight">Payment failed</h1>
          <p className="text-muted-foreground text-sm">
            Your payment could not be processed. You have not been charged.
          </p>
          {searchParams.reason && (
            <p className="text-xs text-muted-foreground bg-secondary rounded-md px-4 py-2 mt-3 font-mono">
              {decodeURIComponent(searchParams.reason)}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/store/checkout"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <RefreshCcw size={14} /> Try again
          </Link>
          <Link
            href="/store/cart"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md border border-border text-sm hover:bg-secondary transition-colors"
          >
            <ShoppingBag size={14} /> Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
