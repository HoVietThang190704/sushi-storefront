"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { storeConfigKey } from "@/hooks/use-store-config";
import { getRealtimeSocketUrl, type StoreConfig } from "@/lib/api";

/**
 * StoreConfigRealtime:
 * Listener duy nhất trên toàn bộ tab Storefront:
 * - Mở đúng 1 kết nối Socket.IO tới namespace /realtime cho toàn bộ ứng dụng.
 * - Khi nhận sự kiện 'store-config:updated', kích hoạt invalidateQueries để TanStack Query
 *   gọi lại REST endpoint GET /api/orders/store-config lấy cấu hình mới nhất.
 * - Khi socket kết nối (bao gồm cả khi reconnect sau khi mất mạng), tự động invalidate
 *   để đảm bảo không bị lỡ bất kỳ thay đổi nào.
 * - Phát toast cảnh báo khi cửa hàng bật/tắt tính năng nhận đơn trong thời gian thực.
 * - Cleanup sạch sẽ listener và socket khi unmount.
 */
export function StoreConfigRealtime() {
  const queryClient = useQueryClient();
  const prevEnabledRef = React.useRef<boolean | null>(null);

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

    const handleUpdate = async () => {
      await queryClient.invalidateQueries({ queryKey: storeConfigKey });

      const newData = queryClient.getQueryData<StoreConfig>(storeConfigKey);
      const newEnabled = newData?.customerOrderingEnabled ?? true;

      if (prevEnabledRef.current !== null && prevEnabledRef.current !== newEnabled) {
        if (!newEnabled) {
          toast.warning("Cửa hàng tạm ngừng nhận đơn", {
            description:
              "Tính năng đặt hàng trực tuyến vừa được tắt. Vui lòng liên hệ hotline để đặt món.",
            duration: 8000,
          });
        } else {
          toast.success("Cửa hàng đã mở nhận đơn trở lại!", {
            description: "Bạn có thể tiếp tục đặt món trực tuyến.",
            duration: 5000,
          });
        }
      }

      prevEnabledRef.current = newEnabled;
    };

    socket.on("store-config:updated", handleUpdate);
    socket.on("connect", () => void handleUpdate());

    return () => {
      socket.off("store-config:updated", handleUpdate);
      socket.off("connect");
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}
