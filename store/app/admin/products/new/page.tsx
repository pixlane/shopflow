import { getCategories } from "@/lib/store";
import { ProductForm } from "@/components/admin/product-form";
export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-base font-semibold">New Product</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Add a new product to your store</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}