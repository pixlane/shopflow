import { getProducts } from "@/lib/store";
import { ProductsClient } from "@/components/admin/products-client";
export const dynamic = "force-dynamic";
export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductsClient initialProducts={products} />;
}