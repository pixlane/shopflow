import { getCategories } from "@/lib/store";
import { CategoriesClient } from "@/components/admin/categories-client";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
