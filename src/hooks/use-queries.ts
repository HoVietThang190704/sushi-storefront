"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchProducts,
  fetchShippingLocations,
  calculateShippingFee,
  fetchPaymentConfig,
  trackOrder,
  type Category,
  type Product,
  type WardLocationItem,
  type ShippingCalculationResult,
  type StorePaymentConfig,
  type TrackOrderResponse,
} from "@/lib/api";

// 1. Query Key Factory chuẩn hóa cho toàn Storefront
export const queryKeys = {
  categories: ["catalog", "categories"] as const,
  products: (categoryId?: string) => ["catalog", "products", categoryId || "all"] as const,
  shippingLocations: ["shipping", "locations"] as const,
  shippingFee: (district?: string, ward?: string, branchId?: string) =>
    ["shipping", "calculate", district || "", ward || "", branchId || ""] as const,
  paymentConfig: ["orders", "payment-config"] as const,
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

export function useShippingFee(params: {
  district?: string;
  ward?: string;
  branchId?: string;
  enabled?: boolean;
}) {
  const { district, ward, branchId, enabled = true } = params;
  return useQuery<ShippingCalculationResult | null>({
    queryKey: queryKeys.shippingFee(district, ward, branchId),
    queryFn: () =>
      ward
        ? calculateShippingFee({
            district,
            ward,
            branchId,
          })
        : Promise.resolve(null),
    enabled: Boolean(enabled && ward),
    retry: false,
  });
}

export function usePaymentConfig() {
  return useQuery<StorePaymentConfig | null>({
    queryKey: queryKeys.paymentConfig,
    queryFn: fetchPaymentConfig,
  });
}

export function useTrackOrder(orderCode?: string, token?: string) {
  return useQuery<TrackOrderResponse | null>({
    queryKey: ["orders", "track", orderCode, token],
    queryFn: () => (orderCode ? trackOrder(orderCode, token) : Promise.resolve(null)),
    enabled: Boolean(orderCode && orderCode.trim().length > 0 && orderCode !== "ORD-PENDING"),
  });
}
