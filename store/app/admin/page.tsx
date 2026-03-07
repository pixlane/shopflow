export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
