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
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function OrderSuccessView() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "ORD-PENDING";
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép mã đơn hàng!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        {/* ==================== BIỂU TƯỢNG THÀNH CÔNG ==================== */}
        <div className="size-20 sm:size-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="size-10 sm:size-12 stroke-[2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary dark:text-red-400 mb-2">
          <Sparkles className="size-3.5" />
          <span>XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">
          Cảm Ơn Bạn Đã Đặt Món!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Đơn hàng của bạn đã được chuyển thẳng tới bếp Hanbi Sushi. Các đầu bếp lành nghề sẽ chuẩn bị món ăn tươi ngon nhất đúng giờ hẹn của bạn.
        </p>

        {/* ==================== CARD MÃ ĐƠN HÀNG ==================== */}
        <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-left shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/70">
            <div>
              <span className="text-xs text-muted-foreground block">Mã đơn hàng Take Away</span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-primary tracking-wider">
                {orderCode}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-2 rounded-xl text-xs h-9 font-medium self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Sao chép mã</span>
                </>
              )}
            </Button>
          </div>

          {/* TIẾN TRÌNH 4 BƯỚC */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide block">
              Tiến độ chuẩn bị món ăn
            </span>

            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              <div className="space-y-1.5">
                <div className="size-9 sm:size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Check className="size-4 sm:size-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-foreground block">
                  Đã tiếp nhận
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Đang xử lý
                </span>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="size-9 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <ChefHat className="size-4 sm:size-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground block">
                  Chế biến
                </span>
                <span className="text-[9px] text-muted-foreground">Theo thứ tự</span>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="size-9 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <Package className="size-4 sm:size-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground block">
                  Đóng gói
                </span>
                <span className="text-[9px] text-muted-foreground">Kèm đá gel</span>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="size-9 sm:size-10 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center mx-auto">
                  <Store className="size-4 sm:size-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground block">
                  Sẵn sàng
                </span>
                <span className="text-[9px] text-muted-foreground">Tại quầy</span>
              </div>
            </div>
          </div>

          {/* HƯỚNG DẪN NHẬN MÓN */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              <span>Hướng dẫn nhận món tại quầy:</span>
            </div>
            <p className="leading-relaxed">
              Bạn vui lòng đến quầy thu ngân Hanbi Sushi theo khung giờ đã hẹn và đọc mã đơn hàng <strong>{orderCode}</strong> hoặc số điện thoại để nhân viên bàn giao phần ăn kèm hóa đơn nhé.
            </p>
          </div>
        </div>

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full sm:w-auto h-12 rounded-xl text-sm font-semibold gap-2 shadow-md"
            )}
          >
            <ShoppingBag className="size-4" />
            <span>Tiếp tục khám phá Thực đơn</span>
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto h-12 rounded-xl text-sm font-medium"
            )}
          >
            <span>Về Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
