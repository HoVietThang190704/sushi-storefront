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
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
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
    const res = await fetch("/api/catalog/categories", {
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
    const url = categoryId
      ? `/api/catalog/products?categoryId=${encodeURIComponent(categoryId)}`
      : "/api/catalog/products";
    const res = await fetch(url, {
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
