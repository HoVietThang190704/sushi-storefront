"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Store,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  PhoneCall,
  ShoppingBag,
  Calendar,
  CreditCard,
  User,
  Phone,
  FileText,
  History,
  ChevronRight,
  Truck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackOrder, cancelGuestOrder, formatPrice, TrackOrderResponse } from "@/lib/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface RecentOrderLocal {
  code: string;
  token?: string;
  totalAmount?: number | string;
  createdAt: string;
}

const ORDER_STEPS = [
  { key: "PENDING", label: "Chờ tiếp nhận", desc: "Đơn hàng đã gửi tới hệ thống", icon: Clock },
  { key: "CONFIRMED", label: "Đã xác nhận", desc: "Cửa hàng đã xác nhận đơn", icon: CheckCircle2 },
  { key: "PREPARING", label: "Đang chế biến", desc: "Đầu bếp đang thực hiện", icon: ChefHat },
  { key: "READY_FOR_PICKUP", label: "Chờ giao hàng", desc: "Món ăn đã đóng hộp giữ nhiệt", icon: Package },
  { key: "DELIVERING", label: "Đang giao hàng", desc: "Shipper đang giao tới địa chỉ của bạn", icon: Truck },
  { key: "COMPLETED", label: "Đã giao thành công", desc: "Đơn hàng đã hoàn tất", icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PREPARING":
      return 2;
    case "READY_FOR_PICKUP":
      return 3;
    case "DELIVERING":
      return 4;
    case "COMPLETED":
      return 5;
    default:
      return -1;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">Chờ tiếp nhận</Badge>;
    case "CONFIRMED":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">Đã xác nhận</Badge>;
    case "PREPARING":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">Đang chế biến</Badge>;
    case "READY_FOR_PICKUP":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">Chờ giao hàng</Badge>;
    case "DELIVERING":
      return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">Đang giao hàng</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className="bg-emerald-600 text-white border-transparent">Đã giao thành công</Badge>;
    case "CANCELLED":
      return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function TrackOrderView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryCode = searchParams.get("code") || "";
  const queryToken = searchParams.get("token") || "";
  const queryPhone = searchParams.get("phone") || "";

  const [inputCode, setInputCode] = React.useState(queryCode);
  const [inputPhone, setInputPhone] = React.useState(queryPhone);

  const [order, setOrder] = React.useState<TrackOrderResponse | null>(null);
  const [activeToken, setActiveToken] = React.useState<string>(queryToken);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Đơn hàng gần đây từ localStorage
  const [recentOrders, setRecentOrders] = React.useState<RecentOrderLocal[]>([]);

  // Modal hủy đơn
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);

  // Đọc danh sách đơn gần đây
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hanbi_recent_orders");
        if (stored) {
          const list: RecentOrderLocal[] = JSON.parse(stored);
          setRecentOrders(list);
        }
      }
    } catch (e) {
      console.warn("Could not read recent orders from storage", e);
    }
  }, []);

  const executeTrack = React.useCallback(
    async (codeToTrack: string, tokenToTrack?: string, phoneToTrack?: string, isSilent = false) => {
      const cleanCode = codeToTrack.trim();
      if (!cleanCode) {
        if (!isSilent) toast.error("Vui lòng nhập mã đơn hàng");
        return;
      }

      // Tìm token trong localStorage nếu chưa có
      let token = tokenToTrack?.trim();
      if (!token && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("hanbi_recent_orders");
          if (stored) {
            const list: RecentOrderLocal[] = JSON.parse(stored);
            const found = list.find((o) => o.code.toUpperCase() === cleanCode.toUpperCase());
            if (found?.token) {
              token = found.token;
            }
          }
        } catch {
          // ignore
        }
      }

      const phone = phoneToTrack?.trim();

      if (!token && !phone) {
        if (!isSilent) toast.error("Vui lòng nhập Số điện thoại đã đặt hàng để xác thực đơn");
        return;
      }

      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await trackOrder(cleanCode, token || undefined, phone || undefined);
        setOrder(data);
        if (token) {
          setActiveToken(token);
        }
        if (!isSilent) {
          toast.success("Đã tìm thấy thông tin đơn hàng!");
        }
      } catch (err) {
        console.error("Track order error:", err);
        const msg = err instanceof Error ? err.message : "Không tìm thấy thông tin đơn hàng";
        if (!isSilent) toast.error(msg);
        setOrder(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Tự động tra cứu nếu URL có sẵn code và token/phone
  React.useEffect(() => {
    if (queryCode && (queryToken || queryPhone)) {
      executeTrack(queryCode, queryToken, queryPhone, true);
    }
  }, [queryCode, queryToken, queryPhone, executeTrack]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputCode.trim()) params.set("code", inputCode.trim());
    if (inputPhone.trim()) params.set("phone", inputPhone.trim());

    router.replace(`/track-order?${params.toString()}`);
    executeTrack(inputCode, undefined, inputPhone, false);
  };

  const handleSelectRecentOrder = (recent: RecentOrderLocal) => {
    setInputCode(recent.code);
    setInputPhone("");
    const params = new URLSearchParams({ code: recent.code });
    if (recent.token) {
      params.set("token", recent.token);
    }
    router.replace(`/track-order?${params.toString()}`);
    executeTrack(recent.code, recent.token, undefined, false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Đã sao chép mã đơn hàng!");
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!activeToken) {
      toast.error("Bạn đang tra cứu bằng số điện thoại. Để hủy đơn, vui lòng mở lại thiết bị hoặc liên hệ hotline 1900 6868.");
      return;
    }

    setIsCancelling(true);
    try {
      await cancelGuestOrder(order.code, activeToken, cancelReason.trim() || "Khách hàng tự hủy trên web");
      toast.success("Đã hủy đơn hàng thành công");
      setShowCancelModal(false);
      // Refresh order
      executeTrack(order.code, activeToken, undefined, true);
    } catch (err) {
      console.error("Cancel order error:", err);
      const msg = err instanceof Error ? err.message : "Không thể hủy đơn hàng";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Realtime Socket.IO Sync cho đơn hàng khi có trackingTicket
  React.useEffect(() => {
    if (!order?.code || !order?.trackingTicket) {
      return;
    }

    // Đơn đã hoàn tất hoặc hủy không cần kết nối socket
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      return;
    }

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

    socket.on("connect_error", (err) => {
      console.warn("Realtime order tracking socket warning:", err.message);
    });

    socket.on("order:updated", (data: { orderCode?: string; status?: string }) => {
      if (data?.orderCode === order.code) {
        toast.info("Trạng thái đơn hàng vừa được cập nhật!", {
          description: `Đơn ${order.code} có cập nhật mới từ quầy.`,
        });
        // Tự động làm mới dữ liệu đơn hàng ngầm (silent)
        executeTrack(order.code, activeToken, undefined, true);
      }
    });

    // Khi kết nối lại sau gián đoạn mạng, đồng bộ lại dữ liệu ngầm 1 lần
    socket.io.on("reconnect", () => {
      executeTrack(order.code, activeToken, undefined, true);
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.code, order?.trackingTicket, order?.status, activeToken, executeTrack]);

  const currentStep = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* ==================== BREADCRUMB ==================== */}
      <div className="hidden sm:block border-b border-border/70 bg-muted/20 py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Tra cứu đơn hàng</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-12">
        {/* ==================== HEADER ==================== */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">
            Theo Dõi Đơn Hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhập mã đơn hàng và số điện thoại để kiểm tra tiến độ chế biến món ăn tại Hanbi Sushi.
          </p>
        </div>

        {/* ==================== GỢI Ý ĐƠN HÀNG GẦN ĐÂY ==================== */}
        {recentOrders.length > 0 && !order && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="size-3.5 text-primary" />
              Đơn hàng gần đây của bạn trên máy này
            </span>
            <div className="space-y-1.5">
              {recentOrders.map((ro) => (
                <button
                  key={ro.code}
                  type="button"
                  onClick={() => handleSelectRecentOrder(ro)}
                  className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/50 hover:border-primary/50 text-left transition-all flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold font-mono text-primary group-hover:underline">
                      {ro.code}
                    </span>
                    {ro.totalAmount && (
                      <span className="text-muted-foreground">
                        ({formatPrice(ro.totalAmount)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                    <span>Xem ngay</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================== SEARCH FORM ==================== */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm max-w-2xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Mã đơn hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="orderCode"
                placeholder="Ví dụ: ORD-20261105-0001"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="h-11 font-mono uppercase"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Số điện thoại đặt món <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Ví dụ: 0901234567"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="h-11"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Nhập số điện thoại bạn đã điền lúc đặt món để hệ thống xác thực.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  <span>Tra cứu tiến độ</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ==================== KẾT QUẢ ĐƠN HÀNG ==================== */}
        {order && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* THÔNG TIN CHUNG CỦA ĐƠN */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-primary">
                      {order.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(order.code)}
                      className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Sao chép mã đơn"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    onClick={() =>
                      executeTrack(
                        order.code,
                        activeToken || undefined,
                        inputPhone || queryPhone || undefined,
                        true
                      )
                    }
                    className="gap-1.5 rounded-xl text-xs h-9"
                  >
                    <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                    <span>Làm mới</span>
                  </Button>

                  {order.canCancel && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="gap-1.5 rounded-xl text-xs h-9"
                    >
                      <XCircle className="size-3.5" />
                      <span>Hủy đơn hàng</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* TIMELINE TIẾN ĐỘ */}
              <div className="pt-8 pb-4">
                {isCancelled ? (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-destructive">Đơn hàng này đã bị hủy</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Đơn đã dừng chế biến. Mọi thắc mắc xin vui lòng liên hệ quầy thu ngân hoặc hotline hỗ trợ.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                      Tiến độ thực hiện món ăn
                    </h3>

                    {/* Desktop Step Bar */}
                    <div className="hidden sm:grid grid-cols-5 gap-3 text-center relative">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="space-y-2">
                            <div
                              className={cn(
                                "size-11 rounded-full flex items-center justify-center mx-auto transition-all duration-300",
                                isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                                isDone && !isCurrent && "bg-emerald-600 text-white",
                                !isDone && "bg-muted text-muted-foreground border border-border"
                              )}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <span
                                className={cn(
                                  "text-xs font-semibold block",
                                  isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight block mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Step List */}
                    <div className="sm:hidden space-y-4">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex items-start gap-3">
                            <div
                              className={cn(
                                "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                                isDone && !isCurrent && "bg-emerald-600 text-white",
                                !isDone && "bg-muted text-muted-foreground border border-border"
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                              <span
                                className={cn(
                                  "text-xs font-semibold block",
                                  isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground block">
                                {step.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* THÔNG BÁO KHI ĐANG CHẾ BIẾN */}
              {order.status === "PREPARING" && (
                <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <ChefHat className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">
                      Đầu bếp đang thực hiện các phần sushi tươi ngon cho bạn!
                    </p>
                    <p>
                      Đơn hàng đã bắt đầu chế biến nên không thể tự hủy trên web. Nếu cần thay đổi gấp, vui lòng gọi hotline{" "}
                      <strong className="text-primary">1900 6868</strong> để nhân viên hỗ trợ trực tiếp.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CHI TIẾT MÓN ĂN & THÔNG TIN KHÁCH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DANH SÁCH MÓN (2 CỘT) */}
              <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    <span>Món đã đặt ({order.items?.length || 0})</span>
                  </h3>
                  <span className="text-xs text-muted-foreground">Giao tận nơi</span>
                </div>

                <div className="divide-y divide-border/60">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">{item.productName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground font-mono">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.shippingFee !== undefined && Number(order.shippingFee) > 0 && (
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-primary" />
                      <span>Phí giao hàng:</span>
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {formatPrice(order.shippingFee)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Tổng thanh toán:</span>
                  <span className="text-lg font-bold font-mono text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* THÔNG TIN NHẬN MÓN (1 CỘT) */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4 self-start">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground pb-3 border-b border-border/70">
                  Thông tin giao hàng
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block">Người nhận:</span>
                      <span className="font-semibold text-foreground">{order.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block">Số điện thoại:</span>
                      <span className="font-semibold text-foreground font-mono">{order.customerPhone}</span>
                    </div>
                  </div>

                  {order.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-muted-foreground block">Địa chỉ nhận hàng:</span>
                        <span className="font-semibold text-foreground leading-relaxed block">
                          {order.address}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <CreditCard className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block">Hình thức thanh toán:</span>
                      <span className="font-semibold text-foreground">
                        {order.paymentMethod === "VIETQR"
                          ? "Chuyển khoản VietQR"
                          : "Tiền mặt khi nhận hàng (COD)"}
                      </span>
                      <div className="mt-1">
                        {order.paymentStatus === "PAID" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                            Đã thanh toán
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                            Chờ thanh toán (COD)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.note && (
                    <div className="flex items-start gap-2 pt-2 border-t border-border/60">
                      <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="text-muted-foreground block">Ghi chú:</span>
                        <p className="italic text-foreground mt-0.5">{order.note}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* HỖ TRỢ */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5 mt-4">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <PhoneCall className="size-3.5 text-primary" />
                    Cần hỗ trợ đơn hàng?
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Hotline Hanbi Sushi: <strong className="text-primary font-mono">1900 6868</strong> (08:00 - 22:00)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODAL XÁC NHẬN HỦY ĐƠN ==================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="size-6 shrink-0" />
              <h3 className="text-base font-bold text-foreground">Xác nhận hủy đơn hàng</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng <strong className="font-mono text-foreground">{order?.code}</strong> không? Hành động này không thể hoàn tác.
            </p>

            <div>
              <Label htmlFor="cancelReason" className="text-xs font-medium block mb-1">
                Lý do hủy (không bắt buộc):
              </Label>
              <Input
                id="cancelReason"
                placeholder="Ví dụ: Đổi ý, muốn đặt món khác..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl text-xs"
              >
                Giữ lại đơn
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="rounded-xl text-xs gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy đơn</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
