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
  Clock,
  Sparkles,
  ArrowRight,
  Truck,
  XCircle,
  Home as HomeIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTrackOrder } from "@/hooks/use-queries";
import { io, Socket } from "socket.io-client";

function getDeliveryStep(status?: string): number {
  switch (status) {
    case "PENDING":
      return 0; // Đã nhận / Chờ xác nhận
    case "CONFIRMED":
    case "PREPARING":
      return 1; // Chế biến
    case "READY_FOR_PICKUP":
      return 2; // Đóng gói
    case "DELIVERING":
    case "COMPLETED":
      return 3; // Giao hàng
    default:
      return 0;
  }
}

export function OrderSuccessView() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code") || "ORD-PENDING";
  const token = searchParams.get("token") || "";
  const [copied, setCopied] = React.useState(false);

  // Trạng thái đơn hàng thực tế lấy qua TanStack Query (tự động fetch, không cascading render)
  const { data: order = null, refetch: refreshOrderDetail } = useTrackOrder(orderCode, token);

  // 2. Kết nối WebSocket để cập nhật Realtime khi quầy bếp chuyển trạng thái
  React.useEffect(() => {
    if (!orderCode || orderCode === "ORD-PENDING") return;
    if (!order?.trackingTicket) return;

    if (order.status === "COMPLETED" || order.status === "CANCELLED") return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : "http://localhost:3000");

    const socket: Socket = io(`${socketUrl}/realtime`, {
      auth: {
        token: order.trackingTicket,
      },
      withCredentials: false,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("order:updated", (data: { orderCode?: string; status?: string }) => {
      if (data?.orderCode === orderCode) {
        toast.info("Tiến trình đơn hàng vừa được cập nhật!", {
          description: `Đơn ${orderCode} đã chuyển trạng thái mới.`,
        });
        refreshOrderDetail();
      }
    });

    socket.io.on("reconnect", () => {
      refreshOrderDetail();
    });

    return () => {
      socket.disconnect();
    };
  }, [orderCode, order?.trackingTicket, order?.status, refreshOrderDetail]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép mã đơn hàng!");
  };

  const activeStep = getDeliveryStep(order?.status);
  const isCancelled = order?.status === "CANCELLED";

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

          {/* TIẾN TRÌNH 4 BƯỚC (CẬP NHẬT REALTIME THEO BẾP & SHIPPERS) */}
          {isCancelled ? (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-destructive text-xs">
              <XCircle className="size-5 shrink-0" />
              <div>
                <span className="font-bold block">Đơn hàng này đã bị hủy</span>
                <span className="text-2xs text-muted-foreground">Nếu có thắc mắc, quý khách vui lòng liên hệ hotline 1900 6868.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-foreground uppercase tracking-wide block">
                  Các bước chế biến &amp; giao hàng
                </span>
                {order?.status && (
                  <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Trực tiếp từ quán</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-1">
                {/* Bước 1: Tiếp nhận */}
                <div className="space-y-1">
                  <div
                    className={cn(
                      "size-8 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                      activeStep >= 0
                        ? "bg-emerald-500 text-white"
                        : "bg-muted border border-border text-muted-foreground"
                    )}
                  >
                    <Check className="size-4 stroke-[2.5]" />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs block",
                      activeStep === 0 ? "font-bold text-primary" : "font-semibold text-foreground"
                    )}
                  >
                    Đã nhận
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium block">
                    {activeStep === 0 ? "Chờ xác nhận" : "Hoàn thành"}
                  </span>
                </div>

                {/* Bước 2: Chế biến */}
                <div
                  className={cn(
                    "space-y-1 transition-opacity",
                    activeStep < 1 && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                      activeStep > 1
                        ? "bg-emerald-500 text-white"
                        : activeStep === 1
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted border border-border text-muted-foreground"
                    )}
                  >
                    {activeStep > 1 ? (
                      <Check className="size-4 stroke-[2.5]" />
                    ) : (
                      <ChefHat className="size-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs block",
                      activeStep === 1 ? "font-bold text-primary" : "font-medium text-foreground"
                    )}
                  >
                    Chế biến
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground block">
                    {activeStep === 1 ? "Đang làm món" : "Tươi ngon"}
                  </span>
                </div>

                {/* Bước 3: Đóng gói */}
                <div
                  className={cn(
                    "space-y-1 transition-opacity",
                    activeStep < 2 && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                      activeStep > 2
                        ? "bg-emerald-500 text-white"
                        : activeStep === 2
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted border border-border text-muted-foreground"
                    )}
                  >
                    {activeStep > 2 ? (
                      <Check className="size-4 stroke-[2.5]" />
                    ) : (
                      <Package className="size-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs block",
                      activeStep === 2 ? "font-bold text-primary" : "font-medium text-foreground"
                    )}
                  >
                    Đóng gói
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground block">
                    {activeStep === 2 ? "Chờ shipper" : "Kèm đá gel"}
                  </span>
                </div>

                {/* Bước 4: Giao hàng */}
                <div
                  className={cn(
                    "space-y-1 transition-opacity",
                    activeStep < 3 && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                      order?.status === "COMPLETED"
                        ? "bg-emerald-500 text-white"
                        : activeStep === 3
                        ? "bg-primary text-primary-foreground animate-bounce"
                        : "bg-muted border border-border text-muted-foreground"
                    )}
                  >
                    {order?.status === "COMPLETED" ? (
                      <Check className="size-4 stroke-[2.5]" />
                    ) : (
                      <Truck className="size-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs block",
                      activeStep === 3 ? "font-bold text-primary" : "font-medium text-foreground"
                    )}
                  >
                    Giao hàng
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground block">
                    {order?.status === "COMPLETED"
                      ? "Đã nhận món"
                      : activeStep === 3
                      ? "Đang giao"
                      : "Đến tận nơi"}
                  </span>
                </div>
              </div>
            </div>
          )}

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
