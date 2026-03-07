// ─── DB-aligned types (matches Supabase schema exactly) ─────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  created_at?: string | null
  // UI aliases
  productCount?: number
  sortOrder?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  compare_price?: number | null
  category_id?: string | null
  images: string[]
  stock: number
  is_featured?: boolean | null
  is_new?: boolean | null
  badge?: string | null
  tags?: string[] | null
  weight_grams?: number | null
  created_at?: string | null
  updated_at?: string | null
  // joined relation
  categories?: Category | null
}

export type ProductWithCategory = Product & { categories?: Category | null }

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  order_number?: string | null
  user_id?: string | null
  guest_email?: string | null
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address?: Record<string, string> | null
  payment_method?: string | null
  status: OrderStatus
  created_at?: string | null
  updated_at?: string | null
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string | null
  product_name: string
  product_image?: string | null
  price: number
  quantity: number
  subtotal: number
}

export interface Profile {
  id: string
  email?: string | null
  full_name?: string | null
  role?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount?: number | null
  max_uses?: number | null
  used_count?: number | null
  is_active?: boolean | null
  expires_at?: string | null
  created_at?: string | null
}

export interface MediaFile {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  width?: number
  height?: number
  alt?: string
  uploadedAt?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UploadResult {
  url: string
  filename: string
  size: number
  mimeType: string
  width?: number
  height?: number
}
