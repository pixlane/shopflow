import { getCategories } from "@/lib/store";
import { CategoriesClient } from "@/components/admin/categories-client";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  const categories = getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
