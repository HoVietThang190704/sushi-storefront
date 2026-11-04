import * as React from "react";
import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Giỏ Hàng Take Away | Hanbi Sushi",
  description:
    "Xem lại giỏ hàng và tiến hành đặt món sushi trực tuyến mang về tiện lợi tại Hanbi Sushi.",
};

export default function CartPage() {
  return <CartView />;
}
