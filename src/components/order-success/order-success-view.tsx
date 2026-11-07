"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  ChefHat,
  Package,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  Home as HomeIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function OrderSuccessView() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "ORD-PENDING";
  const token = searchParams.get("token") || "";
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép mã đơn hàng!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 sm:py-16">
      {/* ==================== APP-LIKE TOP BAR (MOBILE) ==================== */}
      <div className="sm:hidden border-b border-border/70 bg-card/95 backdrop-blur-md px-3 h-14 sticky top-0 z-40 flex items-center justify-between">
        <Link
          href="/"
          className="size-10 flex items-center justify-center -ml-1 text-foreground/80 hover:text-foreground active:scale-90 transition-all rounded-full"
          aria-label="Về trang chủ"
        >
          <HomeIcon className="size-5" />
        </Link>
        <h1 className="font-semibold text-base text-foreground tracking-tight select-none">
          Đặt món thành công
        </h1>
        <div className="size-10" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-6 sm:pt-0 text-center">
        {/* ==================== BIỂU TƯỢNG THÀNH CÔNG ==================== */}
        <div className="size-16 sm:size-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4 sm:mb-6 shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="size-8 sm:size-12 stroke-[2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary dark:text-red-400 mb-1.5">
          <Sparkles className="size-3 sm:size-3.5" />
          <span>XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG</span>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">
          Cảm Ơn Bạn Đã Đặt Món!
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Đơn hàng đã được chuyển tới bếp Hanbi Sushi để các đầu bếp chuẩn bị món ăn tươi ngon nhất đúng giờ hẹn của bạn.
        </p>

        {/* ==================== CARD MÃ ĐƠN HÀNG & THAO TÁC ==================== */}
        <div className="mt-5 sm:mt-8 rounded-2xl border border-border/80 bg-card p-4 sm:p-8 text-left shadow-xs space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-3 pb-3.5 sm:pb-5 border-b border-border/70">
            <div>
              <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">
                Mã đơn hàng giao tận nơi
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-primary tracking-wider">
                {orderCode}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1.5 rounded-xl text-xs h-8.5 sm:h-9 font-medium border-border/80 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </Button>
          </div>

          {/* NÚT THEO DÕI ĐƠN HÀNG (PRIMARY CTA - ĐẶT NGAY DƯỚI MÃ ĐƠN) */}
          <Link
            href={`/track-order?code=${encodeURIComponent(orderCode)}${token ? `&token=${encodeURIComponent(token)}` : ""}`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full h-12 sm:h-12.5 rounded-xl text-sm sm:text-base font-semibold gap-2 shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] transition-all flex items-center justify-center"
            )}
          >
            <Clock className="size-4 sm:size-4.5" />
            <span>Theo dõi tiến trình đơn hàng</span>
            <ArrowRight className="size-4" />
          </Link>

          {/* TIẾN TRÌNH 4 BƯỚC */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wide block">
              Các bước chế biến &amp; giao hàng
            </span>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-1">
              <div className="space-y-1">
                <div className="size-8 sm:size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Check className="size-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-foreground block">
                  Đã nhận
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                  Chờ xác nhận
                </span>
              </div>

              <div className="space-y-1 opacity-60">
                <div className="size-8 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <ChefHat className="size-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-foreground block">
                  Chế biến
                </span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Tươi ngon</span>
              </div>

              <div className="space-y-1 opacity-60">
                <div className="size-8 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <Package className="size-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-foreground block">
                  Đóng gói
                </span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Kèm đá gel</span>
              </div>

              <div className="space-y-1 opacity-60">
                <div className="size-8 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <Store className="size-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-foreground block">
                  Giao hàng
                </span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Đến tận nơi</span>
              </div>
            </div>
          </div>

          {/* HƯỚNG DẪN NHẬN MÓN */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="size-3.5 text-primary" />
              <span>Lưu ý khi nhận hàng:</span>
            </div>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              Shipper Hanbi Sushi sẽ liên hệ qua số điện thoại của bạn khi đơn hàng đến nơi. Bạn vui lòng giữ máy để nhận món ăn tươi ngon đúng hẹn nhé!
            </p>
          </div>
        </div>

        {/* NÚT PHỤ: KHÁM PHÁ THỰC ĐƠN / VỀ TRANG CHỦ */}
        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-medium gap-2 border-border/80"
            )}
          >
            <ShoppingBag className="size-4" />
            <span>Khám phá thêm Thực đơn</span>
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "w-full sm:w-auto h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Về Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
