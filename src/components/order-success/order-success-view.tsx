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
  Receipt,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTrackOrder } from "@/hooks/use-queries";
import { useStoreConfig } from "@/hooks/use-store-config";
import { formatPrice, getRealtimeSocketUrl } from "@/lib/api";
import { BankTransferQrBox } from "@/components/payment/bank-transfer-qr-box";
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
  const [showItemDetails, setShowItemDetails] = React.useState(false);
  const { contactPhone, contactPhoneTel } = useStoreConfig();

  // Trạng thái đơn hàng thực tế lấy qua TanStack Query
  const { data: order = null, refetch: refreshOrderDetail } = useTrackOrder(orderCode, token);

  // Kết nối WebSocket để cập nhật Realtime khi quầy bếp chuyển trạng thái
  React.useEffect(() => {
    if (!orderCode || orderCode === "ORD-PENDING") return;
    if (!order?.trackingTicket) return;

    if (order.status === "COMPLETED" || order.status === "CANCELLED") return;

    const socketUrl = getRealtimeSocketUrl();

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

  const totalItemCount = React.useMemo(() => {
    return order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order?.items?.length || 0;
  }, [order?.items]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 sm:py-14">
      {/* ==================== APP-LIKE TOP BAR (MOBILE) ==================== */}
      <div className="sm:hidden border-b border-border/70 bg-card/95 backdrop-blur-md px-3.5 h-13 sticky top-0 z-40 flex items-center justify-between">
        <Link
          href="/"
          className="size-9 flex items-center justify-center -ml-1 text-foreground/80 hover:text-foreground active:scale-90 transition-all rounded-full"
          aria-label="Về trang chủ"
        >
          <HomeIcon className="size-4.5" />
        </Link>
        <span className="font-semibold text-sm text-foreground tracking-tight select-none">
          Đặt món thành công
        </span>
        <div className="size-9" />
      </div>

      <div className="mx-auto max-w-xl px-4 sm:px-6 pt-5 sm:pt-0">
        {/* ==================== BIỂU TƯỢNG & LỜI CẢM ƠN ==================== */}
        <div className="text-center">
          <div className="relative size-14 sm:size-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/35 flex items-center justify-center mx-auto text-emerald-500 mb-3.5 sm:mb-5 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="size-7 sm:size-10 stroke-[2.2]" />
            <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-white">
              <Sparkles className="size-2.5" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-2xs sm:text-xs font-semibold mb-2">
            <span>ĐÃ XÁC NHẬN ĐẶT HÀNG</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-bold font-serif text-foreground tracking-tight">
            Cảm Ơn Quý Khách!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Bếp Hanbi Sushi đã nhận đơn và chuẩn bị món ăn tươi ngon nhất đúng giờ hẹn của bạn.
          </p>
        </div>

        {/* ==================== KHỐI NỘI DUNG CHÍNH ==================== */}
        <div className="mt-5 sm:mt-7 space-y-3.5 sm:space-y-4.5">
          {/* 1. CARD MÃ ĐƠN HÀNG (RECEIPT TICKET STYLE) */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-2xs sm:text-xs text-muted-foreground font-medium block">
                  Mã đơn hàng giao tận nơi
                </span>
                <span className="text-lg sm:text-2xl font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
                  {orderCode}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-1.5 rounded-xl text-xs h-9 font-medium border-border/80 shrink-0 bg-secondary/30 hover:bg-secondary/60 active:scale-95 transition-all"
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
          </div>

          {/* 2. CARD TIẾN TRÌNH CHẾ BIẾN & GIAO HÀNG */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
            {isCancelled ? (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-destructive text-xs">
                <XCircle className="size-5 shrink-0" />
                <div>
                  <span className="font-bold block">Đơn hàng này đã bị hủy</span>
                  <span className="text-2xs text-muted-foreground">
                    Vui lòng liên hệ hotline{" "}
                    <a href={`tel:${contactPhoneTel}`} className="underline font-mono text-foreground">
                      {contactPhone}
                    </a>{" "}
                    nếu cần hỗ trợ.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Tiến trình đơn hàng
                  </span>
                  <span className="text-2xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shrink-0 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="whitespace-nowrap">Trực tiếp từ quán</span>
                  </span>
                </div>

                {/* 4 BƯỚC STEPPER ĐỒNG BỘ MÀU EMERALD (KHÔNG DÙNG MÀU ĐỎ NHẦM LẪN) */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center pt-1.5">
                  {/* Bước 1: Đã nhận */}
                  <div className="space-y-1.5">
                    <div
                      className={cn(
                        "size-9 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                        activeStep >= 0
                          ? "bg-emerald-600 text-white shadow-emerald-600/25"
                          : "bg-muted border border-border text-muted-foreground"
                      )}
                    >
                      <Check className="size-4 stroke-[2.5]" />
                    </div>
                    <span
                      className={cn(
                        "text-2xs sm:text-xs block leading-tight",
                        activeStep === 0
                          ? "font-bold text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-foreground"
                      )}
                    >
                      Đã nhận
                    </span>
                    <span className="text-3xs text-muted-foreground font-medium block">
                      {activeStep === 0 ? "Chờ xác nhận" : "Hoàn thành"}
                    </span>
                  </div>

                  {/* Bước 2: Chế biến */}
                  <div className={cn("space-y-1.5 transition-opacity", activeStep < 1 && "opacity-60")}>
                    <div
                      className={cn(
                        "size-9 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                        activeStep > 1
                          ? "bg-emerald-600 text-white"
                          : activeStep === 1
                          ? "bg-emerald-600 text-white animate-pulse shadow-emerald-600/30"
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
                        "text-2xs sm:text-xs block leading-tight",
                        activeStep === 1
                          ? "font-bold text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-foreground"
                      )}
                    >
                      Chế biến
                    </span>
                    <span className="text-3xs text-muted-foreground block">
                      {activeStep === 1 ? "Đang làm món" : "Đầu bếp"}
                    </span>
                  </div>

                  {/* Bước 3: Đóng gói */}
                  <div className={cn("space-y-1.5 transition-opacity", activeStep < 2 && "opacity-60")}>
                    <div
                      className={cn(
                        "size-9 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                        activeStep > 2
                          ? "bg-emerald-600 text-white"
                          : activeStep === 2
                          ? "bg-emerald-600 text-white animate-pulse shadow-emerald-600/30"
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
                        "text-2xs sm:text-xs block leading-tight",
                        activeStep === 2
                          ? "font-bold text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-foreground"
                      )}
                    >
                      Đóng gói
                    </span>
                    <span className="text-3xs text-muted-foreground block">
                      {activeStep === 2 ? "Chờ shipper" : "Hộp giữ nhiệt"}
                    </span>
                  </div>

                  {/* Bước 4: Giao hàng */}
                  <div className={cn("space-y-1.5 transition-opacity", activeStep < 3 && "opacity-60")}>
                    <div
                      className={cn(
                        "size-9 sm:size-10 rounded-full flex items-center justify-center mx-auto shadow-xs transition-colors",
                        order?.status === "COMPLETED"
                          ? "bg-emerald-600 text-white"
                          : activeStep === 3
                          ? "bg-emerald-600 text-white animate-bounce shadow-emerald-600/30"
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
                        "text-2xs sm:text-xs block leading-tight",
                        activeStep === 3
                          ? "font-bold text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-foreground"
                      )}
                    >
                      Giao hàng
                    </span>
                    <span className="text-3xs text-muted-foreground block">
                      {order?.status === "COMPLETED"
                        ? "Đã giao"
                        : activeStep === 3
                        ? "Đang giao"
                        : "Tận nơi"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI QUÉT MÃ QR NẾU ĐƠN LÀ CHUYỂN KHOẢN */}
          {order && (order.paymentMethod === "VIETQR" || order.paymentMethod === "BANK_TRANSFER") && (
            <BankTransferQrBox
              orderCode={order.code}
              totalAmount={order.totalAmount}
              paymentQrUrl={order.paymentQrUrl}
              paymentBankInfo={order.paymentBankInfo}
              isPaid={order.paymentStatus === "PAID"}
            />
          )}

          {/* 3. CARD TÓM TẮT ĐƠN HÀNG (MINI RECEIPT - GIÚP KHÁCH YÊN TÂM VỀ ĐƠN VỪA ĐẶT) */}
          {order && (
            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Tóm tắt đơn hàng
                  </span>
                  {totalItemCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-semibold bg-secondary text-foreground">
                      {totalItemCount} món
                    </span>
                  )}
                </div>

                {order.items && order.items.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowItemDetails(!showItemDetails)}
                    className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
                  >
                    <span>{showItemDetails ? "Thu gọn" : "Xem tất cả"}</span>
                    {showItemDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>
                )}
              </div>

              {/* Danh sách món ăn đã đặt */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2 text-xs">
                  {(showItemDetails ? order.items : order.items.slice(0, 2)).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-2xs font-bold text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="text-foreground font-medium truncate">
                          {item.productName}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-foreground shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}

                  {!showItemDetails && order.items.length > 2 && (
                    <div className="text-2xs text-muted-foreground pt-0.5 italic">
                      + và {order.items.length - 2} món khác...
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin người nhận & Địa chỉ giao */}
              <div className="pt-2 border-t border-border/60 text-2xs space-y-1.5 text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 leading-relaxed">
                    <span className="font-bold text-foreground mr-1.5">
                      {order.customerName} ({order.customerPhone})
                    </span>
                    <span>
                      {order.address}
                      {order.ward ? `, ${order.ward}` : ""}
                      {order.district ? `, ${order.district}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span>Hình thức thanh toán:</span>
                  <span className="font-semibold text-foreground">
                    {order.paymentMethod === "CASH" ? "Tiền mặt khi nhận hàng (COD)" : order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs font-bold">
                  <span className="text-foreground">Tổng thanh toán:</span>
                  <span className="font-mono text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. LƯU Ý KHI NHẬN HÀNG */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-500 dark:text-amber-400">
              <Clock className="size-3.5" />
              <span>Lưu ý khi nhận hàng:</span>
            </div>
            <p className="leading-relaxed text-2xs sm:text-xs text-foreground/80">
              Shipper Hanbi Sushi sẽ liên hệ qua số điện thoại của bạn khi đơn hàng đến nơi. Bạn vui lòng giữ máy để nhận món ăn tươi ngon đúng hẹn nhé!
            </p>
          </div>
        </div>

        {/* ==================== BỘ NÚT HÀNH ĐỘNG THUMB-ZONE ==================== */}
        <div className="mt-5 sm:mt-7 space-y-2.5">
          {/* PRIMARY CTA: THEO DÕI ĐƠN HÀNG */}
          <Link
            href={`/track-order?code=${encodeURIComponent(orderCode)}${token ? `&token=${encodeURIComponent(token)}` : ""}`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full h-12 rounded-xl text-sm sm:text-base font-bold gap-2 shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] transition-all flex items-center justify-center"
            )}
          >
            <Clock className="size-4.5" />
            <span>Theo dõi tiến trình đơn hàng</span>
            <ArrowRight className="size-4.5" />
          </Link>

          {/* SECONDARY CTA: XEM THỰC ĐƠN / VỀ TRANG CHỦ */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-10.5 rounded-xl text-xs font-semibold gap-1.5 border-border/80 bg-card hover:bg-secondary flex items-center justify-center"
              )}
            >
              <ShoppingBag className="size-3.5" />
              <span>Xem Thực đơn</span>
            </Link>

            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-10.5 rounded-xl text-xs font-semibold gap-1.5 border-border/80 bg-card hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              )}
            >
              <HomeIcon className="size-3.5" />
              <span>Về Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
