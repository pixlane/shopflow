/**
 * lib/data.ts
 * 
 * Thin wrapper that exposes the in-memory store's seed data
 * as plain arrays for storefront pages (Server Components).
 * 
 * Import from "@/lib/store" directly when you need CRUD functions.
 */
import { getProducts, getCategories } from "./store";

export { getProducts, getCategories };
export const products = await getProducts({ });
export const categories = await getCategories();
