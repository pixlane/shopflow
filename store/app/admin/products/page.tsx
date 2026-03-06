import { getProducts } from "@/lib/store";
import { ProductsClient } from "@/components/admin/products-client";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = getProducts();
  return <ProductsClient initialProducts={products} />;
}
