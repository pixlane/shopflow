// Auto-aligned with Supabase schema — do not add camelCase aliases here

export type { 
  DbCategory as Category,
  DbProduct as Product,
  DbProductWithCategory as ProductWithCategory,
  DbOrder as Order,
  DbOrderStatus as OrderStatus,
} from '@/lib/store'

// Extra UI-only types
export interface CartItem {
  product: import('@/lib/store').DbProductWithCategory
  quantity: number
}

export interface WishlistItem {
  product: import('@/lib/store').DbProductWithCategory
}

export interface MediaFile {
  id: string
  url: string
  filename: string
  size: number
  mimeType: string
  alt?: string
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
