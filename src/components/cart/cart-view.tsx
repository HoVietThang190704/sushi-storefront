"use client";

import * as React from "react";
import Link from "next/link";
import {
  HomeIcon,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  UtensilsCrossed,
  PackageCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/api";
import { SafeImage } from "@/components/ui/safe-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CartView() {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { items, updateQuantity, removeItem, clearCart, totalPrice } =
    useCartStore();

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const calculatedTotal = totalPrice();
  const isEmpty = items.length === 0;

  const handleClearAll = () => {
    clearCart();
    toast.success("Đã làm trống giỏ hàng");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 sm:pb-24">
      {/* ==================== BREADCRUMB (DESKTOP) ==================== */}
      <div className="hidden sm:block border-b border-border/70 bg-muted/20 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HomeIcon className="size-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium text-foreground">Giỏ hàng đặt món</span>
          </nav>
        </div>
      </div>

      {/* ==================== APP-LIKE TOP BAR (MOBILE) ==================== */}
      <div className="sm:hidden border-b border-border/70 bg-card/95 backdrop-blur-md px-3 h-14 sticky top-0 z-40 flex items-center justify-between">
        <Link
          href="/menu"
          className="size-10 flex items-center justify-center -ml-1 text-foreground/80 hover:text-foreground active:scale-90 transition-all rounded-full"
          aria-label="Quay lại thực đơn"
        >
          <ChevronLeft className="size-6 stroke-[2]" />
        </Link>
        <h1 className="font-semibold text-base text-foreground tracking-tight select-none">
          Giỏ hàng của bạn
        </h1>
        <div className="size-10 flex items-center justify-center -mr-1">
          {!isEmpty && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive active:text-destructive font-medium p-1 transition-colors"
              title="Xóa toàn bộ giỏ hàng"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-12">
        {/* ==================== TIÊU ĐỀ TRANG (DESKTOP) ==================== */}
        <div className="hidden sm:flex items-center justify-between pb-6 border-b border-border/70">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary dark:text-red-400">
              <span className="h-0.5 w-6 bg-primary dark:bg-red-500" />
              <span>GIAO HÀNG TẬN NƠI • ご注文確認</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold font-serif text-foreground tracking-tight">
              Giỏ Hàng Của Bạn
            </h1>
          </div>

          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Xóa toàn bộ</span>
            </Button>
          )}
        </div>

        {/* ==================== NỘI DUNG GIỎ HÀNG ==================== */}
        {isEmpty ? (
          /* TRẠNG THÁI GIỎ HÀNG TRỐNG */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="size-20 sm:size-24 rounded-full bg-muted/40 border border-border flex items-center justify-center mx-auto text-muted-foreground mb-6">
              <ShoppingBag className="size-10 sm:size-12 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-serif">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Bạn chưa chọn món ăn nào. Hãy dạo qua thực đơn sushi tươi ngon chuẩn vị Nhật Bản của Hanbi Sushi nhé!
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "gap-2 rounded-xl text-sm font-semibold shadow-md"
                )}
              >
                <UtensilsCrossed className="size-4" />
                <span>Khám phá Thực đơn ngay</span>
              </Link>
            </div>
          </div>
        ) : (
          /* DANH SÁCH MÓN & TỔNG KẾT */
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* CỘT TRÁI: DANH SÁCH MÓN ĂN */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-card divide-y divide-border/50 overflow-hidden shadow-xs">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-5 flex gap-3.5 sm:gap-6 hover:bg-muted/10 transition-colors"
                    >
                      {/* Ảnh món */}
                      <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-muted/30 shrink-0 border border-border/50 self-start">
                        <SafeImage
                          src={item.imageUrl || "/images/placeholder-dish.svg"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover"
                          fallbackSrc="/images/placeholder-dish.svg"
                          fallbackText={item.name}
                        />
                      </div>

                      {/* Thông tin món */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                              {item.name}
                            </h3>
                            {/* Nút xóa nhanh (Mobile) */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground/40 hover:text-destructive active:text-destructive p-1 -mr-1 transition-colors rounded-lg touch-manipulation sm:hidden shrink-0"
                              title="Xóa món"
                              aria-label={`Xóa ${item.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-bold text-sm sm:text-base text-primary font-mono">
                              {formatPrice(lineTotal)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[11px] text-muted-foreground">
                                ({formatPrice(item.price)}/phần)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bộ chọn số lượng (Mobile) */}
                        <div className="flex items-center justify-end mt-2.5 sm:hidden">
                          <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity === 1) {
                                  removeItem(item.id);
                                } else {
                                  updateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted/60 transition-colors"
                              aria-label={item.quantity === 1 ? "Xóa món" : "Giảm số lượng"}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="size-3.5 text-destructive/80" />
                              ) : (
                                <Minus className="size-3.5" />
                              )}
                            </button>
                            <span className="w-8 text-center text-xs font-bold font-mono text-foreground select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-muted/60 transition-colors"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bộ chọn số lượng & Giá thành tiền (Desktop) */}
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="inline-flex items-center rounded-xl border border-border bg-card shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeItem(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={item.quantity === 1 ? "Xóa món" : "Giảm số lượng"}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="size-3.5 text-destructive/80" />
                            ) : (
                              <Minus className="size-3.5" />
                            )}
                          </button>
                          <span className="w-9 text-center text-xs font-bold font-mono text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="font-extrabold text-base text-primary font-mono w-28 text-right">
                          {formatPrice(lineTotal)}
                        </span>

                        {/* Nút xóa (Desktop) */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground/60 hover:text-destructive p-1.5 transition-colors"
                          title="Xóa món"
                          aria-label={`Xóa ${item.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Link
                  href="/menu"
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-foreground transition-all active:scale-[0.99]"
                >
                  <Plus className="size-4 text-primary" />
                  <span>Chọn thêm món khác từ Thực đơn</span>
                </Link>
              </div>
            </div>

            {/* CỘT PHẢI: BẢNG TÓM TẮT ĐƠN HÀNG (Ẩn trên mobile vì đã có thanh cố định ở đáy) */}
            <div className="hidden sm:block lg:col-span-4">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6 sticky top-24">
                <h3 className="font-bold text-lg font-serif text-foreground pb-4 border-b border-border/70">
                  Tóm Tắt Đơn Hàng
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Số lượng món</span>
                    <span className="font-medium text-foreground">
                      {items.reduce((sum, item) => sum + item.quantity, 0)} phần
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatPrice(calculatedTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2 text-muted-foreground">
                    <div>
                      <span>Bao bì & đá gel giữ lạnh</span>
                      <span className="block text-[11px] text-muted-foreground/75">Hộp giữ nhiệt chuyên dụng</span>
                    </div>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                      Miễn phí
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex justify-between items-baseline">
                    <span className="font-bold text-base text-foreground">Tổng tiền món</span>
                    <span className="text-2xl font-extrabold text-primary font-mono tracking-tight">
                      {formatPrice(calculatedTotal)}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block space-y-2 pt-2">
                  <Link
                    href="/checkout"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full h-12 rounded-xl text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
                    )}
                  >
                    <span>Tiến hành Giao hàng</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <PackageCheck className="size-4 text-primary shrink-0" />
                    <span>Giao Hàng Tận Nơi Nhanh Chóng</span>
                  </div>
                  <p>
                    Đơn hàng được chế biến và đóng hộp giữ lạnh chuyên dụng, giao tận nơi trong khu vực TP.HCM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== STICKY BOTTOM BAR (MOBILE THUMB ZONE) ==================== */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 p-3 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-muted-foreground block truncate">
                Tổng cộng ({items.reduce((sum, item) => sum + item.quantity, 0)} phần)
              </span>
              <span className="text-lg font-extrabold font-mono text-primary truncate block leading-tight">
                {formatPrice(calculatedTotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "h-11 px-5 rounded-xl font-semibold gap-1.5 shadow-md shrink-0 text-sm active:scale-95 transition-transform"
              )}
            >
              <span>Thanh toán</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
