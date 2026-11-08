"use client";

import * as React from "react";
import Link from "next/link";
import { User, Package, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentOrderLocal {
  code: string;
  token?: string;
  totalAmount?: number | string;
  createdAt: string;
}

function getRecentOrderSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("hanbi_recent_orders");
  } catch {
    return null;
  }
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function AccountDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const storedOrders = React.useSyncExternalStore(
    subscribeToStorage,
    getRecentOrderSnapshot,
    () => null
  );

  // Đọc đơn hàng gần nhất từ localStorage an toàn cho SSR và không cascading render
  const recentOrder = React.useMemo(() => {
    if (!storedOrders) return null;
    try {
      const list: RecentOrderLocal[] = JSON.parse(storedOrders);
      return list && list.length > 0 ? list[0] : null;
    } catch {
      return null;
    }
  }, [storedOrders]);

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex" ref={menuRef}>
      {/* NÚT ICON USER */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Tài khoản & Đơn mua"
        aria-label="Tài khoản & Đơn mua"
        className={cn(
          "relative size-9 transition-colors",
          isOpen && "bg-accent text-foreground"
        )}
      >
        <User className="size-5" />
        {/* Chấm thông báo có đơn gần đây */}
        {recentOrder && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        )}
      </Button>

      {/* DROPDOWN MENU PHONG CÁCH SHOPEE */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-border/80 bg-card p-3 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150 text-foreground">
          {/* HEADER DROPDOWN */}
          <div className="px-3 py-2.5 pb-3 border-b border-border/70 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="size-5" />
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground block truncate">
                  Khách hàng
                </span>
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded font-medium">
                  Guest
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Hanbi Sushi Take Away
              </p>
            </div>
          </div>

          {/* KHỐI ĐƠN HÀNG GẦN ĐÂY (NẾU CÓ) */}
          {recentOrder && (
            <div className="p-2.5 mt-2 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="size-3 text-primary" />
                  Đơn hàng gần nhất
                </span>
                <span className="font-mono text-primary font-bold">
                  {recentOrder.code}
                </span>
              </div>
              <Link
                href={`/track-order?code=${encodeURIComponent(recentOrder.code)}${
                  recentOrder.token ? `&token=${encodeURIComponent(recentOrder.token)}` : ""
                }`}
                onClick={() => setIsOpen(false)}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center justify-between border border-border transition-colors group"
              >
                <span>Theo dõi tiến trình</span>
                <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          {/* DANH MỤC THAO TÁC SHOPEE STYLE */}
          <div className="mt-2 space-y-1 text-xs">
            {/* ĐƠN MUA CỦA TÔI */}
            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-foreground font-medium group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Package className="size-4" />
                </div>
                <div>
                  <span className="block font-semibold">Đơn mua của tôi</span>
                  <span className="text-[10px] text-muted-foreground">
                    Kiểm tra tiến độ đơn hàng Take Away
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* ĐĂNG NHẬP / THÀNH VIÊN */}
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <span className="block font-medium text-foreground">Đăng nhập thành viên</span>
                  <span className="text-[10px] text-muted-foreground">
                    Tích điểm đổi quà Hanbi Rewards
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
