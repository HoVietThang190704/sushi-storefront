"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { storeConfigKey } from "@/hooks/use-store-config";
import { getRealtimeSocketUrl } from "@/lib/api";

/**
 * StoreConfigRealtime:
 * Listener duy nhất trên toàn bộ tab Storefront:
 * - Mở đúng 1 kết nối Socket.IO tới namespace /realtime cho toàn bộ ứng dụng.
 * - Khi nhận sự kiện 'store-config:updated', kích hoạt invalidateQueries để TanStack Query
 *   gọi lại REST endpoint GET /api/orders/store-config lấy cấu hình mới nhất.
 * - Khi socket kết nối (bao gồm cả khi reconnect sau khi mất mạng), tự động invalidate
 *   để đảm bảo không bị lỡ bất kỳ thay đổi nào.
 * - Cleanup sạch sẽ listener và socket khi unmount.
 */
export function StoreConfigRealtime() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const socketUrl = getRealtimeSocketUrl();

    const socket: Socket = io(`${socketUrl}/realtime`, {
      withCredentials: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    const handleUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: storeConfigKey });
    };

    socket.on("store-config:updated", handleUpdate);
    socket.on("connect", handleUpdate);

    return () => {
      socket.off("store-config:updated", handleUpdate);
      socket.off("connect", handleUpdate);
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}
