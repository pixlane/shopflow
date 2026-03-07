"use server"

import { supabaseAdmin } from './supabase-admin'
import type { Product, Category, Order, OrderItem, ProductWithCategory } from '@/types/supabase'

// ── PRODUCTS ──────────────────────────────────────────

export async function getProducts(options?: {
  category?: string
  featured?: boolean
  isNew?: boolean
  limit?: number
}): Promise<ProductWithCategory[]> {
  let query = supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .gt('stock', 0)
    .order('created_at', { ascending: false })

  if (options?.category) {
    query = query.eq('categories.slug', options.category)
  }
  if (options?.featured) {
    query = query.eq('is_featured', true)
  }
  if (options?.isNew) {
    query = query.eq('is_new', true)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) {
    console.error('getProducts error:', error)
    return []
  }
  return (data ?? []) as ProductWithCategory[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as ProductWithCategory
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  return getProducts({ featured: true, limit })
}

export async function getNewArrivals(limit = 4): Promise<ProductWithCategory[]> {
  return getProducts({ isNew: true, limit })
}

export async function searchProducts(query: string): Promise<ProductWithCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(*)')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20)

  if (error) return []
  return (data ?? []) as ProductWithCategory[]
}

// ── CATEGORIES ───────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name')

  if (error) return []
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

// ── ORDERS ────────────────────────────────────────────

export async function createOrder(orderData: {
  userId?: string
  guestEmail?: string
  items: { productId: string; name: string; image?: string; price: number; quantity: number }[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  shippingAddress: Record<string, string>
  paymentMethod?: string
}): Promise<Order | null> {
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

  if (orderError || !order) {
    console.error('createOrder error:', orderError)
    return null
  }

  // Insert order items
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
  if (itemsError) {
    console.error('createOrder items error:', itemsError)
  }

  // Decrement stock
  for (const item of orderData.items) {
    await supabaseAdmin.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    })
  }

  return order
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single()

  if (error) return null
  return data
}

export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

// ── ADMIN ────────────────────────────────────────────

export async function getAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*), profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  return !error
}

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

// ── DISCOUNT CODES ────────────────────────────────────

export async function validateDiscountCode(code: string, orderAmount: number) {
  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return { valid: false, message: 'Invalid discount code' }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, message: 'Discount code has expired' }
  }

  if (data.max_uses && data.used_count >= data.max_uses) {
    return { valid: false, message: 'Discount code has reached its usage limit' }
  }

  if (orderAmount < data.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount is $${data.min_order_amount}`,
    }
  }

  const discountAmount =
    data.type === 'percentage'
      ? (orderAmount * data.value) / 100
      : data.value

  return {
    valid: true,
    code: data,
    discountAmount: Math.min(discountAmount, orderAmount),
  }
}
