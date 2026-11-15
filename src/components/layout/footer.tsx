"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStoreConfig } from "@/hooks/use-store-config";

export function Footer() {
  const pathname = usePathname();
  const { contactPhone, contactPhoneTel } = useStoreConfig();

  // Tránh hydration mismatch khi server render và client render có route pathname khác nhau
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isMinimalMobile =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/order-success" ||
    pathname === "/menu" ||
    pathname?.startsWith("/menu/") ||
    pathname === "/track-order";

  return (
    <footer
      id="footer-contact"
      suppressHydrationWarning
      className={cn(
        "border-t border-border/60 bg-card text-foreground scroll-mt-20",
        isMounted && isMinimalMobile && "hidden sm:block"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative flex h-10 w-40 items-center justify-start">
              <Image
                src="/images/logo.svg"
                alt="HANBI SUSHI"
                width={160}
                height={40}
                unoptimized
                className="h-full w-auto object-contain object-left"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hệ thống sushi tươi ngon chuẩn vị Nhật Bản. Đặt trực tuyến, đóng hộp giữ lạnh chuyên dụng và giao hàng tận nơi nhanh chóng tại TP.HCM.
            </p>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-primary transition-colors"
                >
                  Thực đơn món ăn
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-primary transition-colors"
                >
                  Giỏ hàng đặt món
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-primary transition-colors"
                >
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Giờ phục vụ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Thời Gian Phục Vụ
            </h4>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Thứ Hai - Chủ Nhật</p>
                <p className="mt-0.5">10:00 - 22:00 hàng ngày</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  (Nhận đơn giao hàng đến 21:30)
                </p>
              </div>
            </div>
          </div>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Hỗ Trợ Khách Hàng
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a
                  href={`tel:${contactPhoneTel}`}
                  className="font-medium text-foreground hover:text-primary transition-colors font-mono"
                >
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span>Giao hàng tận nơi tại các chi nhánh khu vực TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 HANBI SUSHI Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
