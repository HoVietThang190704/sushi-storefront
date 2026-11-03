import * as React from "react";
import type { Metadata } from "next";
import { OrderSuccessView } from "@/components/order-success/order-success-view";

export const metadata: Metadata = {
  title: "Đặt Hàng Thành Công | Hanbi Sushi",
  description:
    "Cảm ơn bạn đã đặt món sushi mang về tại Hanbi Sushi. Đơn hàng của bạn đang được chuẩn bị chu đáo.",
};

export default function OrderSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <OrderSuccessView />
    </React.Suspense>
  );
}
