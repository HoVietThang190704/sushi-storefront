"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreConfigRealtime } from "./store-config-realtime";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Global TanStack Query Provider cho toàn bộ Storefront:
 * - Cấu hình staleTime 5 phút: Menu và danh mục món ăn lưu cache tức thì, chuyển trang không bị giật/skeleton.
 * - Tắt refetchOnWindowFocus mặc định để tránh giật lag khi khách chuyển qua lại giữa các ứng dụng trên điện thoại.
 * - Gắn StoreConfigRealtime: duy trì duy nhất 1 WebSocket listener trên tab để tự động đồng bộ cấu hình cửa hàng realtime.
 * - Khởi tạo QueryClient an toàn qua useState theo chuẩn React 19 / Next.js App Router.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 phút
            gcTime: 1000 * 60 * 30, // 30 phút
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StoreConfigRealtime />
      {children}
    </QueryClientProvider>
  );
}
