"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchProducts,
  fetchShippingLocations,
  trackOrder,
  type Category,
  type Product,
  type WardLocationItem,
  type TrackOrderResponse,
} from "@/lib/api";

// 1. Query Key Factory chuẩn hóa cho toàn Storefront
export const queryKeys = {
  categories: ["catalog", "categories"] as const,
  products: (categoryId?: string) => ["catalog", "products", categoryId || "all"] as const,
  shippingLocations: ["shipping", "locations"] as const,
  orderTracking: (code?: string) => ["orders", "track", code] as const,
};

// 2. Custom Hooks bọc TanStack Query cho Storefront
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });
}

export function useProducts(categoryId?: string) {
  return useQuery<Product[]>({
    queryKey: queryKeys.products(categoryId),
    queryFn: () => fetchProducts(categoryId),
  });
}

export function useShippingLocations() {
  return useQuery<WardLocationItem[]>({
    queryKey: queryKeys.shippingLocations,
    queryFn: fetchShippingLocations,
  });
}

export function useTrackOrder(orderCode?: string, token?: string) {
  return useQuery<TrackOrderResponse | null>({
    queryKey: ["orders", "track", orderCode, token],
    queryFn: () => (orderCode ? trackOrder(orderCode, token) : Promise.resolve(null)),
    enabled: Boolean(orderCode && orderCode.trim().length > 0 && orderCode !== "ORD-PENDING"),
  });
}
