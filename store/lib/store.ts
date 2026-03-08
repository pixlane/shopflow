"use server"

import { supabaseAdmin } from './supabase-admin'

// ── Local DB row types (matches actual Supabase schema) ──────────────────────
export type DbCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  sort_order?: number | null
  created_at?: string
  updated_at?: string
  productCount?: number
}

export type DbProduct = {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  compare_price?: number | null
  category_id?: string | null
  images: string[]
  stock: number
  is_featured?: boolean
  is_new?: boolean
  badge?: string | null
  tags?: string[]
  sku?: string | null
  weight_grams?: number | null
  created_at?: string
  updated_at?: string
}

export type DbProductWithCategory = DbProduct & { categories?: DbCategory | null }

export type DbOrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type DbOrder = {
  id: string
  order_number?: string
  user_id?: string | null
  guest_email?: string | null
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  shipping_address?: Record<string, string>
  payment_method?: string | null
  status: DbOrderStatus
  created_at?: string
  updated_at?: string
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string
  featured?: boolean
  isNew?: boolean
  limit?: number
}): Promise<DbProductWithCategory[]> {
  let query = supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .gt('stock', 0)
    .order('created_at', { ascending: false })

  if (options?.featured) query = query.eq('is_featured', true)
  if (options?.isNew) query = query.eq('is_new', true)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) { console.error('getProducts error:', error); return [] }

  let results = (data ?? []) as unknown as DbProductWithCategory[]

  if (options?.category) {
    results = results.filter((p) => p.categories?.slug === options.category)
  }
  return results
}

export async function getProductBySlug(slug: string): Promise<DbProductWithCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data as unknown as DbProductWithCategory
}

export async function getFeaturedProducts(limit = 8): Promise<DbProductWithCategory[]> {
  return getProducts({ featured: true, limit })
}

export async function getNewArrivals(limit = 4): Promise<DbProductWithCategory[]> {
  return getProducts({ isNew: true, limit })
}

export async function searchProducts(q: string): Promise<DbProductWithCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(20)
  if (error) return []
  return (data ?? []) as unknown as DbProductWithCategory[]
}

export async function getProductById(id: string): Promise<DbProductWithCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('products').select('*, categories(*)').eq('id', id).single()
  if (error) return null
  return data as unknown as DbProductWithCategory
}

export async function createProduct(data: {
  name: string; slug?: string; description?: string; price: number
  compare_price?: number; category_id?: string; images?: string[]
  stock?: number; is_featured?: boolean; is_new?: boolean; badge?: string; tags?: string[]
}) {
  if (!data.slug) {
    data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  const { data: product, error } = await supabaseAdmin
    .from('products').insert(data).select().single()
  if (error) { console.error('createProduct error:', error); return null }
  return product
}

export async function updateProduct(id: string, data: Partial<{
  name: string; slug: string; description: string; price: number
  compare_price: number; category_id: string; images: string[]
  stock: number; is_featured: boolean; is_new: boolean; badge: string; tags: string[]
}>) {
  const { data: product, error } = await supabaseAdmin
    .from('products').update(data).eq('id', id).select().single()
  if (error) { console.error('updateProduct error:', error); return null }
  return product
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  return !error
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export async function getCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('categories').select('*').order('name')
  if (error) return []
  return (data ?? []) as unknown as DbCategory[]
}

export async function getCategoryBySlug(slug: string): Promise<DbCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('categories').select('*').eq('slug', slug).single()
  if (error) return null
  return data as unknown as DbCategory
}

export async function getCategoryById(id: string): Promise<DbCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('categories').select('*').eq('id', id).single()
  if (error) return null
  return data as unknown as DbCategory
}

export async function createCategory(data: {
  name: string; slug: string; description?: string; image_url?: string
}) {
  const { data: cat, error } = await supabaseAdmin
    .from('categories').insert(data).select().single()
  if (error) { console.error('createCategory error:', error); return null }
  return cat
}

export async function updateCategory(id: string, data: Partial<{
  name: string; slug: string; description: string; image_url: string
}>) {
  const { data: cat, error } = await supabaseAdmin
    .from('categories').update(data).eq('id', id).select().single()
  if (error) return null
  return cat
}

export async function deleteCategory(id: string) {
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
  return !error
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
export async function createOrder(orderData: {
  userId?: string; guestEmail?: string
  items: { productId: string; name: string; image?: string; price: number; quantity: number }[]
  subtotal: number; shippingCost: number; discount: number; total: number
  shippingAddress: Record<string, string>; paymentMethod?: string
}): Promise<DbOrder | null> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: orderData.userId ?? null,
      guest_email: orderData.guestEmail ?? null,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost,
      discount: orderData.discount,
      total: orderData.total,
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) { console.error('createOrder error:', orderError); return null }

  const items = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_image: item.image ?? null,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }))

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(items)
  if (itemsError) console.error('createOrder items error:', itemsError)

  for (const item of orderData.items) {
    await supabaseAdmin.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    })
  }

  return order as unknown as DbOrder
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabaseAdmin
    .from('orders').select('*, order_items(*)').eq('order_number', orderNumber).single()
  if (error) return null
  return data
}

export async function getOrderById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('orders').select('*, order_items(*)').eq('id', id).single()
  if (error) return null
  return data
}

export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders').select('*, order_items(*)')
    .eq('user_id', userId).order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*), profiles(full_name, email)')
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getOrders() {
  return getAllOrders()
}

export async function updateOrderStatus(orderId: string, status: DbOrderStatus) {
  const { error } = await supabaseAdmin
    .from('orders').update({ status }).eq('id', orderId)
  return !error
}

// ── CUSTOMERS ─────────────────────────────────────────────────────────────────
export async function getCustomers() {
  const { data, error } = await supabaseAdmin
    .from('profiles').select('*').eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles').select('*, orders(*)').eq('id', id).single()
  if (error) return null
  return data
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabaseAdmin.from('orders').select('total, status, created_at'),
    supabaseAdmin.from('products').select('id, stock'),
    supabaseAdmin.from('profiles').select('id').eq('role', 'customer'),
  ])
  const orders = ordersRes.data ?? []
  const revenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total), 0)
  return {
    totalOrders: orders.length,
    totalRevenue: revenue,
    totalProducts: productsRes.data?.length ?? 0,
    totalCustomers: customersRes.data?.length ?? 0,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  }
}

// ── DISCOUNT CODES ────────────────────────────────────────────────────────────
export async function validateDiscountCode(code: string, orderAmount: number) {
  const { data, error } = await supabaseAdmin
    .from('discount_codes').select('*')
    .eq('code', code.toUpperCase()).eq('is_active', true).single()
  if (error || !data) return { valid: false, message: 'Invalid discount code' }
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return { valid: false, message: 'Discount code has expired' }
  if (data.max_uses && data.used_count >= data.max_uses)
    return { valid: false, message: 'Discount code has reached its usage limit' }
  if (orderAmount < data.min_order_amount)
    return { valid: false, message: `Minimum order amount is $${data.min_order_amount}` }
  const discountAmount = data.type === 'percentage'
    ? (orderAmount * data.value) / 100
    : data.value
  return { valid: true, code: data, discountAmount: Math.min(discountAmount, orderAmount) }
}

export async function getDiscountCodes() {
  const { data, error } = await supabaseAdmin
    .from('discount_codes').select('*').order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function createDiscountCode(data: {
  code: string; type: 'percentage' | 'fixed'; value: number
  min_order_amount?: number; max_uses?: number; expires_at?: string
}) {
  const { data: code, error } = await supabaseAdmin
    .from('discount_codes').insert({ ...data, code: data.code.toUpperCase() })
    .select().single()
  if (error) return null
  return code
}

export async function toggleDiscountCode(id: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('discount_codes').update({ is_active: isActive }).eq('id', id)
  return !error
}

// ── MEDIA ─────────────────────────────────────────────────────────────────────
export async function getMediaFiles() {
  const { data, error } = await supabaseAdmin.storage
    .from('media').list('products', { sortBy: { column: 'created_at', order: 'desc' } })
  if (error) return []
  return (data ?? []).map((file) => {
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('media').getPublicUrl(`products/${file.name}`)
    return {
      id: file.id ?? file.name,
      filename: file.name,
      url: publicUrl,
      size: file.metadata?.size ?? 0,
      mimeType: file.metadata?.mimetype ?? '',
      alt: file.name.replace(/\.[^.]+$/, ''),
    }
  })
}

export async function deleteMedia(path: string) {
  const { error } = await supabaseAdmin.storage.from('media').remove([path])
  return !error
}
