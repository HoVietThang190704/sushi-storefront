import * as React from "react";
import type { Metadata } from "next";
import { MenuView } from "@/components/menu/menu-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Thực Đơn Trực Tuyến & Đặt Mang Đi | Hanbi Sushi",
  description:
    "Khám phá thực đơn Sashimi tươi sống, sushi Nigiri, combo Maki roll và các món ăn Nhật Bản chuẩn vị tại Hanbi Sushi. Đặt món mang về tiện lợi và nhanh chóng.",
};

function MenuLoadingFallback() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-12 w-full max-w-md rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <React.Suspense fallback={<MenuLoadingFallback />}>
      <MenuView />
    </React.Suspense>
  );
}
