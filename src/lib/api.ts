export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  slug?: string | null;
  barcode?: string | null;
  name: string;
  type: "SINGLE" | "COMBO";
  categoryId: string | null;
  sellingPrice: string | number;
  imageUrl?: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  comboItemsAsParent?: Array<{
    quantity: string | number;
    childProduct: Product;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.INTERNAL_API_URL || "http://localhost:3000";
}

export function formatPrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/catalog/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }
    const json: ApiResponse<Category[]> = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("fetchCategories error:", error);
    return [];
  }
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const path = categoryId
      ? `/api/catalog/products?categoryId=${encodeURIComponent(categoryId)}`
      : "/api/catalog/products";
    const res = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const json: ApiResponse<Product[]> = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("fetchProducts error:", error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/catalog/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch product: ${res.statusText}`);
    }
    const json: ApiResponse<Product> = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("fetchProductBySlug error:", error);
    return null;
  }
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  note?: string;
  branchId?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreatedOrderResponse {
  order: {
    id: string;
    code: string;
    orderCode?: string;
    customerName: string;
    customerPhone: string;
    totalAmount: string | number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items?: Array<{
      id: string;
      productName: string;
      quantity: number;
      unitPrice: string | number;
      subtotal: string | number;
    }>;
  };
  trackingToken: string | null;
  isDuplicate?: boolean;
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreatedOrderResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<CreatedOrderResponse> = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
  }
  return json.data;
}

export interface TrackOrderResponse {
  id: string;
  code: string;
  orderCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  note?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string | number;
  createdAt: string;
  items?: Array<{
    id: string;
    productName: string;
    unitPrice: string | number;
    quantity: number;
    subtotal: string | number;
  }>;
  statusHistories?: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    reason?: string | null;
    createdAt: string;
  }>;
}

export async function trackOrder(
  code: string,
  token: string
): Promise<TrackOrderResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/orders/track?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`,
    {
      cache: "no-store",
    }
  );
  const json: ApiResponse<TrackOrderResponse> = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tìm thấy thông tin đơn hàng.");
  }
  return json.data;
}
