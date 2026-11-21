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

export function getRealtimeSocketUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : "http://localhost:3000");
  return rawUrl.replace(/\/+$/, "");
}

export function parsePrice(amount: number | string | null | undefined): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }
  if (typeof amount === "string") {
    const parsed = parseFloat(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatPrice(amount: number | string): string {
  const num = parsePrice(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export async function fetchCategories(): Promise<Category[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/catalog/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }
  const json: ApiResponse<Category[]> = await res.json();
  return json.data || [];
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
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
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
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
  paymentMethod?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface WardLocationItem {
  district: string;
  ward: string;
  wardCode?: string;
  formerWards?: string;
  isSupported: boolean;
  defaultBranch?: {
    id: string;
    code: string;
    name: string;
    address: string;
  };
  supportedBranches: Array<{
    id: string;
    code: string;
    name: string;
    fee: number;
    isDefault: boolean;
  }>;
}

export interface ShippingCalculationResult {
  district?: string;
  ward: string;
  fee: number;
  branch: {
    id: string;
    code: string;
    name: string;
    address: string;
  };
}

export async function fetchShippingLocations(): Promise<WardLocationItem[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/shipping/locations`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch shipping locations: ${res.statusText}`);
  }
  const json: ApiResponse<WardLocationItem[]> = await res.json();
  return json.data || [];
}

export async function calculateShippingFee(params: {
  district?: string;
  ward: string;
  branchId?: string;
}): Promise<ShippingCalculationResult> {
  const baseUrl = getBaseUrl();
  const search = new URLSearchParams({
    ward: params.ward,
  });
  if (params.district) search.set("district", params.district);
  if (params.branchId) search.set("branchId", params.branchId);

  const res = await fetch(`${baseUrl}/api/shipping/calculate?${search.toString()}`);
  const json: ApiResponse<ShippingCalculationResult> = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể tính phí vận chuyển cho khu vực này");
  }
  return json.data;
}

export interface CreatedOrderResponse {
  order: {
    id: string;
    code: string;
    orderCode?: string;
    customerName: string;
    customerPhone: string;
    address?: string;
    district?: string;
    ward?: string;
    shippingFee?: string | number;
    totalAmount: string | number;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    paymentQrUrl?: string | null;
    paymentBankInfo?: string | null;
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
  address?: string | null;
  district?: string | null;
  ward?: string | null;
  note?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentQrUrl?: string | null;
  paymentBankInfo?: string | null;
  shippingFee?: string | number;
  totalAmount: string | number;
  createdAt: string;
  canCancel?: boolean;
  trackingTicket?: string;
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
  token?: string,
  phone?: string
): Promise<TrackOrderResponse> {
  const baseUrl = getBaseUrl();
  const searchParams = new URLSearchParams({ code });
  if (token) searchParams.set("token", token);
  if (phone) searchParams.set("phone", phone);

  const res = await fetch(
    `${baseUrl}/api/orders/track?${searchParams.toString()}`,
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

export async function cancelGuestOrder(
  code: string,
  token: string,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${encodeURIComponent(code)}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, reason }),
  });

  const json: ApiResponse<unknown> = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể hủy đơn hàng.");
  }
  return { success: true };
}

export interface StorePaymentConfig {
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrImageUrl?: string | null;
  transferSyntax?: string | null;
  note?: string | null;
  isActive: boolean;
}

export interface HeroBannerConfigItem {
  id: string;
  imageUrl: string;
  leadTitle?: string;
  highlightTitle?: string;
  description?: string;
  kanjiWatermark?: string;
  isActive?: boolean;
}

export interface StoreConfig {
  id?: string;
  key?: string;
  customerOrderingEnabled: boolean;
  contactPhone: string;
  heroBanners?: HeroBannerConfigItem[] | null;
}

export async function fetchPaymentConfig(): Promise<StorePaymentConfig | null> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/orders/payment-config`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<StorePaymentConfig> = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchStoreConfig(): Promise<StoreConfig> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/store-config`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch store config: HTTP ${res.status}`);
  }
  const json: ApiResponse<StoreConfig> = await res.json();
  if (!json?.data) {
    throw new Error("Invalid store config response structure");
  }
  return json.data;
}
