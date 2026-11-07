import * as React from "react";
import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Thanh Toán & Giao Hàng Tận Nơi TP.HCM | Hanbi Sushi",
  description:
    "Xác nhận thông tin đặt món giao hàng tận nơi nhanh chóng, tươi ngon tại Hanbi Sushi.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
