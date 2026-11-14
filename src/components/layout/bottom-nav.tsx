"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Package, ShoppingBag, Phone } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useStoreConfig } from "@/hooks/use-store-config";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

interface NavTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const isVisible = useScrollDirection({ threshold: 12 });
  const { customerOrderingEnabled, contactPhoneTel } = useStoreConfig();

  // Tránh hydration mismatch bằng useSyncExternalStore
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const totalItems = useCartStore((state) => state.totalItems());

  const tabs: NavTab[] = React.useMemo(
    () => [
      { label: "Trang chủ", href: "/", icon: Home },
      { label: "Thực đơn", href: "/menu", icon: UtensilsCrossed },
      { label: "Đơn mua", href: "/track-order", icon: Package },
      customerOrderingEnabled
        ? { label: "Giỏ hàng", href: "/cart", icon: ShoppingBag, badge: true }
        : { label: "Gọi món", href: `tel:${contactPhoneTel}`, icon: Phone },
    ],
    [customerOrderingEnabled, contactPhoneTel]
  );

  // Ẩn thanh BottomNav trên các màn hình thanh toán, chi tiết món hoặc giỏ hàng có món
  // để nhường không gian cho các nút CTA hành động quan trọng (Thanh toán / Thêm vào giỏ)
  const isMinimalFlow =
    pathname === "/checkout" ||
    pathname === "/order-success" ||
    (pathname === "/cart" && isMounted && totalItems > 0) ||
    (pathname.startsWith("/menu/") && pathname !== "/menu");

  if (isMinimalFlow) {
    return null;
  }

  return (
    <nav
      suppressHydrationWarning
      aria-label="Điều hướng chính trên di động"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden",
        "bg-background/95 backdrop-blur-md border-t border-border/70",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.35)]",
        "transition-transform duration-300 ease-in-out will-change-transform",
        "pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] px-2",
        // Khi lướt xuống -> trượt xuống ẩn; Khi lướt lên -> trượt lên hiện
        !isVisible && "translate-y-full pointer-events-none"
      )}
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 rounded-xl transition-all select-none active:scale-95",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5.5 transition-transform duration-200",
                    isActive ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                  )}
                />

                {/* Badge số lượng món trong giỏ hàng */}
                {tab.badge && isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 animate-in zoom-in-75 duration-150">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>

              {/* Chấm tròn báo hiệu tab đang active */}
              {isActive && (
                <span className="size-1 rounded-full bg-primary mt-0.5 animate-in fade-in duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
