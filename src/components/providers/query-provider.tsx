"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Global TanStack Query Provider cho toàn bộ Storefront:
 * - Cấu hình staleTime 5 phút: Menu và danh mục món ăn lưu cache tức thì, chuyển trang không bị giật/skeleton.
 * - Tắt refetchOnWindowFocus để tránh giật lag khi khách chuyển qua lại giữa các ứng dụng trên điện thoại.
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
      {children}
    </QueryClientProvider>
  );
}
