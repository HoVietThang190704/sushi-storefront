import * as React from "react";
import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Thanh Toán & Đặt Món Take Away | Hanbi Sushi",
  description:
    "Xác nhận thông tin đặt món mang về tiện lợi và nhanh chóng tại Hanbi Sushi.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
