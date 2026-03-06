// ─── Media ────────────────────────────────────────────────────────────────────
export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string;
  uploadedAt: string;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  comparePrice?: number;
  images: string[];
  media?: MediaFile[];
  category: Category;
  tags: string[];
  stock: number;
  sku: string;
  weight?: number;
  dimensions?: { w: number; h: number; d: number };
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  tags: string;
  stock: string;
  sku: string;
  weight: string;
  featured: boolean;
  published: boolean;
  images: string[];
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: Customer;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "partially_paid"
  | "refunded"
  | "voided";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partial"
  | "fulfilled"
  | "returned";

export interface Customer {
  name: string;
  email: string;
  phone?: string;
  address: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}
