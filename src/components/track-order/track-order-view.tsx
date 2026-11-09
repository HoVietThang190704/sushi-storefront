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
  ChevronDown,
  ChevronUp,
  Truck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackOrder, cancelGuestOrder, formatPrice, TrackOrderResponse } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site.config";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface RecentOrderLocal {
  code: string;
  token?: string;
  totalAmount?: number | string;
  createdAt: string;
}

const ORDER_STEPS = [
  { key: "PENDING", label: "Tiếp nhận", desc: "Chờ xác nhận đơn", icon: Clock },
  { key: "CONFIRMED", label: "Đã nhận", desc: "Cửa hàng đã xác nhận", icon: CheckCircle2 },
  { key: "PREPARING", label: "Chế biến", desc: "Bếp đang thực hiện", icon: ChefHat },
  { key: "READY_FOR_PICKUP", label: "Đóng gói", desc: "Hộp giữ nhiệt sẵn sàng", icon: Package },
  { key: "DELIVERING", label: "Giao hàng", desc: "Shipper đang giao tới", icon: Truck },
  { key: "COMPLETED", label: "Hoàn tất", desc: "Đã giao thành công", icon: CheckCircle2 },
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
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 whitespace-nowrap">Chờ tiếp nhận</Badge>;
    case "CONFIRMED":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 whitespace-nowrap">Đã xác nhận</Badge>;
    case "PREPARING":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 whitespace-nowrap">Đang chế biến</Badge>;
    case "READY_FOR_PICKUP":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 whitespace-nowrap">Chờ giao hàng</Badge>;
    case "DELIVERING":
      return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 whitespace-nowrap">Đang giao hàng</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className="bg-emerald-600 text-white border-transparent whitespace-nowrap">Đã giao thành công</Badge>;
    case "CANCELLED":
      return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 whitespace-nowrap">Đã hủy</Badge>;
    default:
      return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>;
  }
}

function getRecentOrdersSnapshot(): string | null {
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
  const [showSearchForm, setShowSearchForm] = React.useState(false);

  const storedRecent = React.useSyncExternalStore(
    subscribeToStorage,
    getRecentOrdersSnapshot,
    () => null
  );

  // Đơn hàng gần đây từ localStorage
  const recentOrders = React.useMemo(() => {
    if (!storedRecent) return [];
    try {
      const list: RecentOrderLocal[] = JSON.parse(storedRecent);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, [storedRecent]);

  // Modal hủy đơn
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);

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
        setShowSearchForm(false);
        setActiveToken(token || "");
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
    if (!queryCode || (!queryToken && !queryPhone)) return;
    let active = true;

    async function autoTrack() {
      let token = queryToken?.trim();
      if (!token && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("hanbi_recent_orders");
          if (stored) {
            const list: RecentOrderLocal[] = JSON.parse(stored);
            const found = list.find((o) => o.code === queryCode.trim());
            if (found?.token) {
              token = found.token;
            }
          }
        } catch {
          // ignore
        }
      }

      try {
        const data = await trackOrder(queryCode.trim(), token, queryPhone?.trim());
        if (active) {
          setOrder(data);
          setShowSearchForm(false);
          setInputCode(data.code);
          if (data.customerPhone) {
            setInputPhone(data.customerPhone);
          }
          setActiveToken(token || "");
        }
      } catch (err) {
        if (active) {
          console.error("Auto track error:", err);
          setOrder(null);
        }
      }
    }

    autoTrack();
    return () => {
      active = false;
    };
  }, [queryCode, queryToken, queryPhone]);

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
      toast.error(`Bạn đang tra cứu bằng số điện thoại. Để hủy đơn, vui lòng mở lại thiết bị hoặc liên hệ hotline ${SITE_CONFIG.hotline}.`);
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
    <div className="min-h-screen bg-background text-foreground pb-32 sm:pb-24">
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

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-5 sm:pt-10">
        {/* ==================== HEADER ==================== */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">
            Theo Dõi Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {order
              ? "Cập nhật tiến độ chế biến và giao món trực tiếp từ Hanbi Sushi."
              : "Nhập mã đơn hàng và số điện thoại để kiểm tra tiến độ món ăn."}
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

        {/* ==================== THANH ĐIỀU HƯỚNG TRA CỨU ĐƠN KHÁC (KHI ĐANG XEM ĐƠN) ==================== */}
        {order && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-2xl border border-border/80 bg-card flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-muted-foreground truncate text-2xs sm:text-xs">
                Đang xem đơn: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{order.code}</strong>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchForm(!showSearchForm)}
              className="h-8 px-2.5 rounded-xl text-2xs sm:text-xs font-semibold gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shrink-0"
            >
              <Search className="size-3.5" />
              <span>{showSearchForm ? "Thu gọn form" : "Tra cứu đơn khác"}</span>
              {showSearchForm ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </Button>
          </div>
        )}

        {/* ==================== SEARCH FORM ==================== */}
        {(!order || showSearchForm) && (
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs max-w-2xl mx-auto mb-8 animate-in fade-in-50 duration-200">
            <form onSubmit={handleSearchSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <Label htmlFor="orderCode" className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Mã đơn hàng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="orderCode"
                  placeholder="Ví dụ: ORD-20261105-0001"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="h-10.5 sm:h-11 font-mono uppercase rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone" className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Số điện thoại đặt món <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Ví dụ: 0901234567"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="h-10.5 sm:h-11 rounded-xl"
                />
                <p className="text-2xs text-muted-foreground mt-1">
                  Nhập số điện thoại bạn đã điền lúc đặt món để hệ thống xác thực.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
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
        )}

        {/* ==================== KẾT QUẢ ĐƠN HÀNG ==================== */}
        {order && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            {/* THÔNG TIN CHUNG CỦA ĐƠN */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/80">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between sm:justify-start gap-2.5 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg sm:text-2xl font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {order.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(order.code)}
                        className="p-1.5 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        title="Sao chép mã đơn"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <p className="text-2xs sm:text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
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
                    className="gap-1.5 rounded-xl text-xs h-9 bg-secondary/30 hover:bg-secondary/60"
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
                      <span>Hủy đơn</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* TIMELINE TIẾN ĐỘ */}
              <div className="pt-6 sm:pt-8 pb-3">
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
                    <h3 className="text-2xs sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5 sm:mb-6">
                      Tiến độ thực hiện món ăn
                    </h3>

                    {/* Desktop Step Bar (6 CỘT CHUẨN) */}
                    <div className="hidden sm:grid grid-cols-6 gap-2 text-center relative">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="space-y-2">
                            <div
                              className={cn(
                                "size-10 rounded-full flex items-center justify-center mx-auto transition-all duration-300",
                                isCurrent && "bg-emerald-600 text-white ring-4 ring-emerald-600/25 scale-105 shadow-md",
                                isDone && !isCurrent && "bg-emerald-600 text-white",
                                !isDone && "bg-muted text-muted-foreground border border-border"
                              )}
                            >
                              <Icon className="size-4.5" />
                            </div>
                            <div>
                              <span
                                className={cn(
                                  "text-xs font-semibold block leading-tight",
                                  isCurrent ? "text-emerald-600 dark:text-emerald-400 font-bold" : isDone ? "text-foreground" : "text-muted-foreground"
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

                    {/* Mobile Step List (CÓ LINE CONNECTOR ĐỒNG BỘ EMERALD) */}
                    <div className="sm:hidden space-y-3.5">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex items-start gap-3 relative">
                            {idx < ORDER_STEPS.length - 1 && (
                              <div
                                className={cn(
                                  "absolute left-4 top-8 w-0.5 h-6 -ml-[1px]",
                                  currentStep > idx ? "bg-emerald-500" : "bg-border"
                                )}
                              />
                            )}
                            <div
                              className={cn(
                                "size-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors",
                                isCurrent && "bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-sm",
                                isDone && !isCurrent && "bg-emerald-600 text-white",
                                !isDone && "bg-muted text-muted-foreground border border-border"
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="space-y-0.5 pt-0.5 min-w-0">
                              <span
                                className={cn(
                                  "text-xs font-bold block",
                                  isCurrent ? "text-emerald-600 dark:text-emerald-400" : isDone ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </span>
                              <span className="text-2xs text-muted-foreground block">
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
                      <a href={`tel:${SITE_CONFIG.hotlineTel}`} className="text-primary font-bold hover:underline font-mono">
                        {SITE_CONFIG.hotline}
                      </a>{" "}
                      để nhân viên hỗ trợ trực tiếp.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CHI TIẾT MÓN ĂN & THÔNG TIN KHÁCH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* DANH SÁCH MÓN (2 CỘT) */}
              <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Món đã đặt ({order.items?.length || 0})</span>
                  </h3>
                  <span className="text-2xs sm:text-xs text-muted-foreground font-medium px-2.5 py-0.5 rounded-full bg-secondary">
                    Giao tận nơi
                  </span>
                </div>

                <div className="divide-y divide-border/60">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-medium text-foreground block truncate">{item.productName}</span>
                        <span className="text-2xs text-muted-foreground font-mono">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground font-mono shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.shippingFee !== undefined && Number(order.shippingFee) > 0 && (
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-2xs sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Phí giao hàng:</span>
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {formatPrice(order.shippingFee)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">Tổng thanh toán:</span>
                  <span className="text-base sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* THÔNG TIN NHẬN MÓN (1 CỘT) */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs space-y-4 self-start">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground pb-3 border-b border-border/70 flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Thông tin giao hàng</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 flex items-baseline justify-between gap-1 flex-wrap">
                      <span className="text-muted-foreground text-2xs">Người nhận:</span>
                      <span className="font-semibold text-foreground">{order.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 flex items-baseline justify-between gap-1 flex-wrap">
                      <span className="text-muted-foreground text-2xs">Số điện thoại:</span>
                      <span className="font-semibold text-foreground font-mono">{order.customerPhone}</span>
                    </div>
                  </div>

                  {order.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground text-2xs block">Địa chỉ nhận hàng:</span>
                        <span className="font-semibold text-foreground leading-relaxed block mt-0.5">
                          {order.address}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 pt-1">
                    <CreditCard className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-muted-foreground text-2xs block">Hình thức thanh toán:</span>
                      <span className="font-semibold text-foreground block mt-0.5">
                        {order.paymentMethod === "VIETQR"
                          ? "Chuyển khoản VietQR"
                          : "Tiền mặt khi nhận hàng (COD)"}
                      </span>
                      <div className="mt-1">
                        {order.paymentStatus === "PAID" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-3xs">
                            Đã thanh toán
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-3xs">
                            Chờ thanh toán (COD)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.note && (
                    <div className="flex items-start gap-2.5 pt-2 border-t border-border/60">
                      <FileText className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground text-2xs block">Ghi chú:</span>
                        <p className="italic text-foreground mt-0.5 leading-relaxed">{order.note}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* HỖ TRỢ GỌI HOTLINE TRỰC TIẾP */}
                <a
                  href={`tel:${SITE_CONFIG.hotlineTel}`}
                  className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/60 text-xs flex items-center justify-between transition-colors mt-3 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <PhoneCall className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground block text-2xs">Cần hỗ trợ đơn hàng?</span>
                      <span className="text-3xs text-muted-foreground">Hotline: <strong className="font-mono text-foreground">{SITE_CONFIG.hotline}</strong></span>
                    </div>
                  </div>
                  <span className="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:underline">Gọi ngay</span>
                </a>
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
