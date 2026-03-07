/**
 * lib/store.ts
 *
 * Server-side singleton in-memory data store.
 * In production this would be replaced by a database (Postgres/Prisma etc.).
 * All mutations go through the exported functions so the logic lives in one place.
 */

import type {
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  MediaFile,
  ProductFormValues,
} from "@/types";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Initial seed data ────────────────────────────────────────────────────────

const seedCategories: Category[] = [
  {
    id: "cat-1",
    name: "Ceramic",
    slug: "ceramic",
    description: "Handthrown and hand-built stoneware and porcelain.",
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Glass",
    slug: "glass",
    description: "Mouth-blown borosilicate and soda-lime glass objects.",
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-3",
    name: "Wood",
    slug: "wood",
    description: "Turned, carved and joined pieces in hardwood.",
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-4",
    name: "Textile",
    slug: "textile",
    description: "Woven and knitted natural-fibre goods.",
    sortOrder: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const seedProducts: Product[] = [
  {
    id: "prod-1",
    slug: "matte-ceramic-vase",
    name: "Matte Ceramic Vase",
    description: "Handcrafted stoneware with a raw, organic finish.",
    longDescription:
      "Each piece is individually thrown on the wheel and fired at high temperature, resulting in a durable matte surface with subtle variations that make every vase unique.",
    price: 89,
    comparePrice: 120,
    images: ["https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[0],
    tags: ["handmade", "home decor", "vase"],
    stock: 12,
    sku: "CER-VAZ-001",
    featured: true,
    published: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-20T14:30:00Z",
  },
  {
    id: "prod-2",
    slug: "blown-glass-bowl",
    name: "Blown Glass Bowl",
    description: "Mouth-blown borosilicate with a smoky amber gradient.",
    longDescription:
      "Made by master glassblowers using traditional techniques. The gradient from clear to rich amber is achieved through a carefully controlled cooling process.",
    price: 145,
    images: ["https://images.pexels.com/photos/1879096/pexels-photo-1879096.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[1],
    tags: ["glass", "bowl", "artisan"],
    stock: 6,
    sku: "GLS-BWL-001",
    featured: true,
    published: true,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-02-21T14:30:00Z",
  },
  {
    id: "prod-3",
    slug: "walnut-serving-board",
    name: "Walnut Serving Board",
    description: "Live-edge black walnut with food-safe oil finish.",
    longDescription:
      "Cut from sustainably sourced black walnut. Finished with multiple coats of food-safe mineral oil to enhance the grain.",
    price: 195,
    comparePrice: 240,
    images: ["https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[2],
    tags: ["wood", "kitchen", "serving"],
    stock: 8,
    sku: "WOD-BRD-001",
    featured: true,
    published: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-22T14:30:00Z",
  },
  {
    id: "prod-4",
    slug: "linen-throw-blanket",
    name: "Linen Throw Blanket",
    description: "100% stonewashed European linen in natural undyed tones.",
    longDescription:
      "Woven on traditional looms from long-staple European flax. Becomes softer with every wash.",
    price: 165,
    images: ["https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[3],
    tags: ["textile", "linen", "home"],
    stock: 20,
    sku: "TEX-THR-001",
    featured: false,
    published: true,
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-23T14:30:00Z",
  },
  {
    id: "prod-5",
    slug: "raku-tea-bowl",
    name: "Raku Tea Bowl",
    description: "Traditional Japanese raku firing, each piece unrepeatable.",
    longDescription:
      "Fired using the ancient Japanese raku technique. The results are unpredictable: metallic lusters, carbon-black surfaces, crackled glazes.",
    price: 68,
    images: ["https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[0],
    tags: ["ceramic", "tea", "japanese"],
    stock: 4,
    sku: "CER-TEA-001",
    featured: false,
    published: true,
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-24T14:30:00Z",
  },
  {
    id: "prod-6",
    slug: "oak-candle-holder",
    name: "Oak Candle Holder Set",
    description: "Turned solid oak, minimal silhouette, set of three.",
    longDescription:
      "Lathe-turned from a single piece of solid white oak. Three-piece set offers varying heights for dynamic tablescapes.",
    price: 78,
    images: ["https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[2],
    tags: ["wood", "candle", "decor"],
    stock: 15,
    sku: "WOD-CND-001",
    featured: false,
    published: true,
    createdAt: "2024-02-12T10:00:00Z",
    updatedAt: "2024-02-25T14:30:00Z",
  },
  {
    id: "prod-7",
    slug: "spun-glass-carafe",
    name: "Spun Glass Carafe",
    description: "Hand-spun borosilicate, 1.2L capacity, lead-free.",
    longDescription:
      "Spun by hand on a glassblower's mandrel. Ultra-thin wall that catches light beautifully. Cork stopper is natural and food-safe.",
    price: 112,
    comparePrice: 135,
    images: ["https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[1],
    tags: ["glass", "carafe", "kitchen"],
    stock: 9,
    sku: "GLS-CAR-001",
    featured: true,
    published: true,
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-26T14:30:00Z",
  },
  {
    id: "prod-8",
    slug: "woven-basket-tray",
    name: "Woven Seagrass Tray",
    description: "Hand-woven seagrass with leather handles, natural finish.",
    longDescription:
      "Woven by artisans using sustainably harvested seagrass. Leather handles are vegetable-tanned.",
    price: 55,
    images: ["https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800"],
    category: seedCategories[3],
    tags: ["textile", "storage", "natural"],
    stock: 18,
    sku: "TEX-TRY-001",
    featured: false,
    published: true,
    createdAt: "2024-02-18T10:00:00Z",
    updatedAt: "2024-02-27T14:30:00Z",
  },
];

const seedOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2024-0001",
    items: [
      { productId: "prod-1", productName: "Matte Ceramic Vase", sku: "CER-VAZ-001", price: 89, quantity: 2, image: "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { productId: "prod-3", productName: "Walnut Serving Board", sku: "WOD-BRD-001", price: 195, quantity: 1, image: "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
    customer: { name: "Emre Yılmaz", email: "emre@example.com", phone: "+90 532 000 0001", address: { line1: "Bağdat Cad. No:42", city: "İstanbul", state: "İstanbul", postalCode: "34710", country: "TR" } },
    status: "delivered",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    subtotal: 373,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 373,
    tags: [],
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-05T16:00:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2024-0002",
    items: [
      { productId: "prod-2", productName: "Blown Glass Bowl", sku: "GLS-BWL-001", price: 145, quantity: 1, image: "https://images.pexels.com/photos/1879096/pexels-photo-1879096.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
    customer: { name: "Ayşe Kaya", email: "ayse@example.com", address: { line1: "Nispetiye Cad. No:15", city: "İstanbul", state: "İstanbul", postalCode: "34340", country: "TR" } },
    status: "processing",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    subtotal: 145,
    shipping: 15,
    discount: 0,
    tax: 0,
    total: 160,
    tags: [],
    createdAt: "2024-02-20T14:30:00Z",
    updatedAt: "2024-02-20T14:30:00Z",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2024-0003",
    items: [
      { productId: "prod-4", productName: "Linen Throw Blanket", sku: "TEX-THR-001", price: 165, quantity: 2, image: "https://images.pexels.com/photos/6045028/pexels-photo-6045028.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { productId: "prod-6", productName: "Oak Candle Holder Set", sku: "WOD-CND-001", price: 78, quantity: 1, image: "https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
    customer: { name: "Mehmet Demir", email: "mehmet@example.com", address: { line1: "Tunalı Hilmi Cad. No:8", city: "Ankara", state: "Ankara", postalCode: "06700", country: "TR" } },
    status: "shipped",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    subtotal: 408,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 408,
    trackingNumber: "TK-9283746501",
    shippingCarrier: "PTT Kargo",
    tags: [],
    createdAt: "2024-02-22T11:00:00Z",
    updatedAt: "2024-02-23T09:00:00Z",
  },
  {
    id: "ord-4",
    orderNumber: "ORD-2024-0004",
    items: [
      { productId: "prod-7", productName: "Spun Glass Carafe", sku: "GLS-CAR-001", price: 112, quantity: 1, image: "https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
    customer: { name: "Selin Öztürk", email: "selin@example.com", address: { line1: "Alsancak Mah. 1382 Sok. No:3", city: "İzmir", state: "İzmir", postalCode: "35220", country: "TR" } },
    status: "pending",
    paymentStatus: "unpaid",
    fulfillmentStatus: "unfulfilled",
    subtotal: 112,
    shipping: 15,
    discount: 0,
    tax: 0,
    total: 127,
    tags: [],
    createdAt: "2024-02-26T16:45:00Z",
    updatedAt: "2024-02-26T16:45:00Z",
  },
  {
    id: "ord-5",
    orderNumber: "ORD-2024-0005",
    items: [
      { productId: "prod-5", productName: "Raku Tea Bowl", sku: "CER-TEA-001", price: 68, quantity: 3, image: "https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { productId: "prod-8", productName: "Woven Seagrass Tray", sku: "TEX-TRY-001", price: 55, quantity: 2, image: "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
    customer: { name: "Can Arslan", email: "can@example.com", address: { line1: "Kızılırmak Cad. No:22", city: "Ankara", state: "Ankara", postalCode: "06510", country: "TR" } },
    status: "confirmed",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    subtotal: 314,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 314,
    notes: "Please wrap individually — gift order.",
    tags: ["gift"],
    createdAt: "2024-02-27T08:30:00Z",
    updatedAt: "2024-02-27T10:00:00Z",
  },
];

const seedMedia: MediaFile[] = [];

// ─── Singleton ────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __store: AppStore | undefined;
}

interface AppStore {
  categories: Category[];
  products: Product[];
  orders: Order[];
  media: MediaFile[];
  orderSeq: number;
}

function createStore(): AppStore {
  return {
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    orders: structuredClone(seedOrders),
    media: structuredClone(seedMedia),
    orderSeq: seedOrders.length,
  };
}

function getStore(): AppStore {
  if (!global.__store) global.__store = createStore();
  return global.__store;
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  const s = getStore();
  return s.categories
    .map((c) => ({
      ...c,
      productCount: s.products.filter((p) => p.category.id === c.id).length,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(id: string): Category | undefined {
  return getStore().categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getStore().categories.find((c) => c.slug === slug);
}

export function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">
): Category {
  const s = getStore();
  const cat: Category = {
    ...data,
    id: uid("cat"),
    createdAt: now(),
    updatedAt: now(),
  };
  s.categories.push(cat);
  return cat;
}

export function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt" | "productCount">>
): Category | null {
  const s = getStore();
  const idx = s.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  s.categories[idx] = { ...s.categories[idx], ...data, updatedAt: now() };
  // sync category reference in products
  s.products = s.products.map((p) =>
    p.category.id === id ? { ...p, category: s.categories[idx] } : p
  );
  return s.categories[idx];
}

export function deleteCategory(id: string): boolean {
  const s = getStore();
  const inUse = s.products.some((p) => p.category.id === id);
  if (inUse) return false; // refuse if products reference it
  const before = s.categories.length;
  s.categories = s.categories.filter((c) => c.id !== id);
  return s.categories.length < before;
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────

export function getProducts(opts?: {
  categorySlug?: string;
  published?: boolean;
  featured?: boolean;
  q?: string;
}): Product[] {
  let list = getStore().products;
  if (opts?.categorySlug)
    list = list.filter((p) => p.category.slug === opts.categorySlug);
  if (opts?.published !== undefined)
    list = list.filter((p) => p.published === opts.published);
  if (opts?.featured !== undefined)
    list = list.filter((p) => p.featured === opts.featured);
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return list;
}

export function getProductById(id: string): Product | undefined {
  return getStore().products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getStore().products.find((p) => p.slug === slug);
}

export function createProduct(values: ProductFormValues): Product {
  const s = getStore();
  const category = s.categories.find((c) => c.id === values.categoryId);
  if (!category) throw new Error("Category not found");

  const product: Product = {
    id: uid("prod"),
    slug: values.slug || slugify(values.name),
    name: values.name,
    description: values.description,
    longDescription: values.longDescription,
    price: parseFloat(values.price) || 0,
    comparePrice: values.comparePrice ? parseFloat(values.comparePrice) : undefined,
    images: values.images,
    category,
    tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
    stock: parseInt(values.stock) || 0,
    sku: values.sku,
    weight: values.weight ? parseFloat(values.weight) : undefined,
    featured: values.featured,
    published: values.published,
    createdAt: now(),
    updatedAt: now(),
  };
  s.products.push(product);
  return product;
}

export function updateProduct(
  id: string,
  values: Partial<ProductFormValues>
): Product | null {
  const s = getStore();
  const idx = s.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const current = s.products[idx];
  const category =
    values.categoryId
      ? s.categories.find((c) => c.id === values.categoryId) ?? current.category
      : current.category;

  s.products[idx] = {
    ...current,
    ...(values.name !== undefined && { name: values.name }),
    ...(values.slug !== undefined && { slug: values.slug }),
    ...(values.description !== undefined && { description: values.description }),
    ...(values.longDescription !== undefined && { longDescription: values.longDescription }),
    ...(values.price !== undefined && { price: parseFloat(values.price) || current.price }),
    ...(values.comparePrice !== undefined && {
      comparePrice: values.comparePrice ? parseFloat(values.comparePrice) : undefined,
    }),
    ...(values.images !== undefined && { images: values.images }),
    ...(values.stock !== undefined && { stock: parseInt(values.stock) || current.stock }),
    ...(values.sku !== undefined && { sku: values.sku }),
    ...(values.weight !== undefined && {
      weight: values.weight ? parseFloat(values.weight) : undefined,
    }),
    ...(values.featured !== undefined && { featured: values.featured }),
    ...(values.published !== undefined && { published: values.published }),
    ...(values.tags !== undefined && {
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }),
    category,
    updatedAt: now(),
  };
  return s.products[idx];
}

export function deleteProduct(id: string): boolean {
  const s = getStore();
  const before = s.products.length;
  s.products = s.products.filter((p) => p.id !== id);
  return s.products.length < before;
}

// ─── Order CRUD ───────────────────────────────────────────────────────────────

export function getOrders(opts?: { status?: OrderStatus }): Order[] {
  let list = getStore().orders;
  if (opts?.status) list = list.filter((o) => o.status === opts.status);
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  return getStore().orders.find((o) => o.id === id);
}

export function updateOrderStatus(
  id: string,
  fields: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    trackingNumber?: string;
    shippingCarrier?: string;
    notes?: string;
    tags?: string[];
  }
): Order | null {
  const s = getStore();
  const idx = s.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  s.orders[idx] = { ...s.orders[idx], ...fields, updatedAt: now() };
  return s.orders[idx];
}

// ─── Media ────────────────────────────────────────────────────────────────────

export function getMedia(): MediaFile[] {
  return getStore().media;
}

export function addMedia(file: Omit<MediaFile, "id" | "uploadedAt">): MediaFile {
  const s = getStore();
  const m: MediaFile = { ...file, id: uid("med"), uploadedAt: now() };
  s.media.unshift(m);
  return m;
}

export function deleteMedia(id: string): boolean {
  const s = getStore();
  const before = s.media.length;
  s.media = s.media.filter((m) => m.id !== id);
  return s.media.length < before;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}
