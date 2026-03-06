import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getCategories } from "@/lib/store";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  const categories = getCategories();

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={15} />
        </Link>
        <div>
          <h1 className="text-base font-semibold">New Product</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the details below to create a new product.
          </p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
