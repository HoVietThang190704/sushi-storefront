"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  User,
  Phone,
  Mail,
  FileText,
  Banknote,
  QrCode,
  PackageCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Edit3,
  MapPin,
  Store,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import {
  formatPrice,
  createOrder,
} from "@/lib/api";
import {
  useShippingLocations,
  useShippingFee,
  usePaymentConfig,
} from "@/hooks/use-queries";
import { saveRecentOrder } from "@/lib/recent-orders";
import { PAYMENT_CONFIG, VIETNAM_PHONE_REGEX } from "@/config/site.config";
import { SafeImage } from "@/components/ui/safe-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStoreConfig } from "@/hooks/use-store-config";
import { AddressSelectionModal } from "@/components/checkout/address-selection-modal";
import { BranchSelectionModal } from "@/components/checkout/branch-selection-modal";

export function CheckoutView() {
  const router = useRouter();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { items, clearCart, totalPrice } = useCartStore();
  const { customerOrderingEnabled, contactPhone, contactPhoneTel } =
    useStoreConfig();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [showMobileSummary, setShowMobileSummary] = React.useState(false);

  // Form Fields
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [streetAddress, setStreetAddress] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState("");
  const [selectedWard, setSelectedWard] = React.useState("");
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "VIETQR">("CASH");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: paymentConfig = null } = usePaymentConfig();

  // Modal / Sheet tìm kiếm Phường/Xã (Tên mới & Tên cũ)
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);

  // Modal / Sheet đổi chi nhánh phục vụ
  const [isBranchModalOpen, setIsBranchModalOpen] = React.useState(false);

  // Dữ liệu vị trí & phí ship quản lý bằng TanStack Query
  const { data: locations = [] } = useShippingLocations();

  // Thông tin Phường/Xã hiện tại được chọn
  const currentWardInfo = React.useMemo(() => {
    if (!selectedWard) return null;
    return locations.find((loc) => loc.ward === selectedWard);
  }, [locations, selectedWard]);

  const validBranchIdForWard = React.useMemo(() => {
    if (!selectedBranchId || !currentWardInfo?.supportedBranches) return undefined;
    const isValid = currentWardInfo.supportedBranches.some((b) => b.id === selectedBranchId);
    return isValid ? selectedBranchId : undefined;
  }, [selectedBranchId, currentWardInfo]);

  const shouldCalculateShipping = Boolean(
    selectedWard && (!currentWardInfo || currentWardInfo.isSupported)
  );

  const {
    data: rawShippingCalc = null,
    isFetching: calculatingFee,
  } = useShippingFee({
    district: selectedDistrict || currentWardInfo?.district,
    ward: selectedWard,
    branchId: validBranchIdForWard,
    enabled: shouldCalculateShipping,
  });

  // Phí ship suy ra từ kết quả tính toán và địa chỉ hợp lệ
  const shippingCalc = React.useMemo(() => {
    if (!shouldCalculateShipping) {
      return null;
    }
    if (rawShippingCalc && rawShippingCalc.ward !== selectedWard) {
      return null;
    }
    return rawShippingCalc;
  }, [shouldCalculateShipping, selectedWard, rawShippingCalc]);

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!customerOrderingEnabled) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
          <Phone className="size-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-foreground">
          Tạm ngưng đặt món trực tuyến
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Cửa hàng hiện đang tạm ngưng nhận đơn hàng trực tuyến qua website. Quý khách vui lòng gọi hotline bên dưới để nhân viên phục vụ đặt món giao tận nơi!
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
          <a
            href={`tel:${contactPhoneTel}`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full rounded-xl font-semibold gap-2 bg-primary text-primary-foreground"
            )}
          >
            <Phone className="size-4" />
            <span>Gọi hotline: {contactPhone}</span>
          </a>
          <Link href="/menu" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full rounded-xl">
              Xem thực đơn
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <ShoppingBag className="size-16 text-muted-foreground/50 mb-4 stroke-[1.5]" />
        <h2 className="text-xl font-bold font-serif text-foreground">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vui lòng chọn món ăn trước khi thực hiện thanh toán.
        </p>
        <Link href="/menu" className="mt-6">
          <Button size="lg" className="rounded-xl font-semibold">
            Quay lại Thực đơn
          </Button>
        </Link>
      </div>
    );
  }

  const subtotalPrice = totalPrice();
  const currentShippingFee = shippingCalc?.fee || 0;
  const calculatedTotal = subtotalPrice + (shippingCalc ? currentShippingFee : 0);

  // Validate Bước 1 và chuyển sang Bước 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    const nameClean = customerName.trim();
    const phoneClean = customerPhone.trim();
    const addressClean = streetAddress.trim();

    if (!nameClean) {
      toast.error("Vui lòng nhập họ và tên người nhận");
      return;
    }

    if (!VIETNAM_PHONE_REGEX.test(phoneClean)) {
      toast.error("Số điện thoại không hợp lệ (cần 10 chữ số chuẩn Việt Nam)");
      return;
    }

    if (!selectedWard) {
      toast.error("Vui lòng chọn Phường / Xã nhận hàng tại TP.HCM");
      return;
    }

    if (currentWardInfo && !currentWardInfo.isSupported) {
      toast.error("Khu vực này hiện chưa được hỗ trợ giao hàng tận nơi. Vui lòng chọn địa chỉ khác.");
      return;
    }

    if (!addressClean) {
      toast.error("Vui lòng nhập số nhà, tên đường chi tiết");
      return;
    }

    if (calculatingFee) {
      toast.info("Đang tính phí giao hàng cho khu vực của bạn, vui lòng đợi trong giây lát...");
      return;
    }

    if (!shippingCalc) {
      toast.error("Chưa tính được phí giao hàng cho khu vực này");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xác nhận đặt hàng ở Bước 2
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatingFee) {
      toast.info("Đang cập nhật phí giao hàng, vui lòng đợi trong giây lát...");
      return;
    }

    if (!shippingCalc) {
      toast.error("Khu vực giao hàng không hợp lệ!");
      return;
    }

    setIsSubmitting(true);

    try {
      const districtName = selectedDistrict || currentWardInfo?.district || "";
      const fullAddress = `${streetAddress.trim()}, ${selectedWard}, ${districtName ? districtName + ", " : ""}TP. Hồ Chí Minh`;

      const res = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        address: fullAddress,
        province: "TP. Hồ Chí Minh",
        district: districtName,
        ward: selectedWard,
        branchId: selectedBranchId || undefined,
        paymentMethod,
        note: note.trim() || undefined,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      });

      clearCart();
      toast.success("Đặt hàng giao tận nơi thành công!");

      const orderCode = res.order.code || res.order.orderCode || "ORD-SUCCESS";

      // Lưu vào localStorage và phát sự kiện đồng bộ trong cùng tab
      saveRecentOrder({
        code: orderCode,
        token: res.trackingToken || "",
        totalAmount: res.order.totalAmount,
        createdAt: new Date().toISOString(),
      });

      const params = new URLSearchParams({
        code: orderCode,
        ...(res.trackingToken ? { token: res.trackingToken } : {}),
      });

      router.push(`/order-success?${params.toString()}`);
    } catch (error: unknown) {
      console.error("Order error:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Đặt món thất bại. Vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
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
            <Link href="/cart" className="hover:text-foreground transition-colors">
              Giỏ hàng
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium text-foreground">Giao Hàng Tận Nơi TP.HCM</span>
          </nav>
        </div>
      </div>

      {/* ==================== APP-LIKE TOP BAR (MOBILE) ==================== */}
      <div className="sm:hidden border-b border-border/70 bg-card/95 backdrop-blur-md px-3 h-14 sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (step === 2) {
              setStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push("/cart");
            }
          }}
          className="size-9 flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95 transition-all rounded-full bg-muted/40"
          aria-label={step === 2 ? "Quay lại bước 1" : "Quay lại giỏ hàng"}
        >
          <ChevronLeft className="size-5 stroke-[2.2]" />
        </button>
        <div className="text-center px-2">
          <h1 className="font-bold text-sm text-foreground tracking-tight leading-tight">
            {step === 1 ? "Giao hàng tận nơi" : "Thanh toán đơn hàng"}
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium">
            {step === 1 ? "TP. Hồ Chí Minh" : "Xác nhận & Hoàn tất"}
          </p>
        </div>
        <div className="size-9 flex items-center justify-center">
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-mono">
            {step}/2
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-8">
        {/* ==================== ACCORDION TÓM TẮT ĐƠN HÀNG (MOBILE) ==================== */}
        <div className="lg:hidden mb-3 rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold bg-muted/25 hover:bg-muted/35 active:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <ShoppingBag className="size-3.5" />
              <span>Xem đơn hàng ({items.length} món)</span>
              <ChevronDown
                className={cn(
                  "size-3 text-muted-foreground transition-transform duration-200",
                  showMobileSummary && "rotate-180"
                )}
              />
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {shippingCalc
                ? formatPrice(calculatedTotal)
                : `${formatPrice(subtotalPrice)} + ship`}
            </span>
          </button>

          {showMobileSummary && (
            <div className="p-3.5 pt-2 border-t border-border/60 space-y-2.5">
              <div className="max-h-56 overflow-y-auto divide-y divide-border/40 pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-2.5">
                    <div className="relative size-10 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/50">
                      <SafeImage
                        src={item.imageUrl || "/images/placeholder-dish.svg"}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        fallbackSrc="/images/placeholder-dish.svg"
                        fallbackText={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Tiền món:</span>
                  <span className="font-mono font-medium">{formatPrice(subtotalPrice)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="size-3 text-primary" />
                    <span>Phí giao hàng:</span>
                  </span>
                  <span className="font-mono font-semibold text-primary">
                    {calculatingFee ? (
                      <Loader2 className="size-3 animate-spin inline" />
                    ) : !selectedWard ? (
                      <span className="text-muted-foreground font-sans text-2xs">Chọn phường/xã</span>
                    ) : currentWardInfo && !currentWardInfo.isSupported ? (
                      <span className="text-destructive font-sans text-2xs font-medium">Chưa hỗ trợ</span>
                    ) : (
                      formatPrice(currentShippingFee)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== STEPPER THANH TIẾN TRÌNH ==================== */}
        {/* Mobile: thanh tiến trình mảnh tinh gọn */}
        <div className="sm:hidden mb-4 px-1">
          <div className="flex items-center justify-between text-2xs font-semibold text-muted-foreground mb-1.5">
            <span className={step === 1 ? "text-primary font-bold" : "text-muted-foreground"}>
              1. Địa chỉ nhận
            </span>
            <span className={step === 2 ? "text-primary font-bold" : "text-muted-foreground"}>
              2. Thanh toán
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Desktop: Stepper chuẩn lớn */}
        <div className="hidden sm:flex items-center justify-center gap-6 pb-6 mb-8 border-b border-border/70">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
              step === 1 ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 1
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {step === 2 ? <Check className="size-4 stroke-[3]" /> : "1"}
            </div>
            <span>1. Địa chỉ nhận hàng</span>
          </button>

          <div className="h-px w-12 sm:w-16 bg-border shrink-0" />

          <div
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
              step === 2 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === 2
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground border border-border/70"
              }`}
            >
              2
            </div>
            <span>2. Thanh toán & Xác nhận</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14">
          {/* CỘT TRÁI: FORM THEO TỪNG BƯỚC */}
          <div className="lg:col-span-7">
            {/* ==================== BƯỚC 1: NHẬP THÔNG TIN GIAO HÀNG ==================== */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4 sm:space-y-6">
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
                  <div className="pb-3 sm:pb-4 border-b border-border/60 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-base sm:text-lg font-serif text-foreground">
                        Thông tin người nhận
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                        Phục vụ giao hàng nhanh trong phạm vi khu vực TP. Hồ Chí Minh
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shrink-0 text-3xs sm:text-[11px] gap-1 font-medium">
                      <Truck className="size-3" />
                      <span>Giao tận nơi</span>
                    </Badge>
                  </div>

                  {/* Họ tên và SĐT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Họ và tên người nhận</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="rounded-xl h-11 text-base sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <span>Số điện thoại nhận hàng</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="rounded-xl h-11 text-base sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Khối chọn địa chỉ Phường/Xã (Đúng chuẩn UX hiện đại) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" />
                      <span>Khu vực giao hàng (Phường / Xã TP.HCM)</span>
                      <span className="text-destructive">*</span>
                    </label>

                    {!selectedWard ? (
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="w-full text-left p-3.5 sm:p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 active:scale-[0.99] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <MapPin className="size-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              Chọn Phường / Xã nhận hàng
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Tìm theo tên mới hoặc tên phường/quận cũ
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    ) : (
                      <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 transition-colors hover:border-primary/40">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="size-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-foreground">
                                {selectedWard}
                              </span>
                              {currentWardInfo?.isSupported ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-3xs font-semibold border-emerald-500/20">
                                  Có giao hàng
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-3xs font-semibold">
                                  Chưa hỗ trợ
                                </Badge>
                              )}
                            </div>
                            {currentWardInfo?.district && (
                              <p className="text-xs text-muted-foreground truncate">
                                {currentWardInfo.district}
                                {currentWardInfo.formerWards && (
                                  <span className="text-muted-foreground/75 font-normal"> • Cũ: {currentWardInfo.formerWards}</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 px-2.5 shrink-0 rounded-lg"
                        >
                          <Edit3 className="size-3 mr-1" />
                          <span>Đổi</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Hiển thị chi nhánh phục vụ & Phí ship tính được */}
                  {selectedWard && (
                    <div className="transition-all">
                      {calculatingFee ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-2 text-xs">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          <span>Đang kiểm tra chi nhánh phục vụ và tính phí giao hàng...</span>
                        </div>
                      ) : currentWardInfo && !currentWardInfo.isSupported ? (
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 sm:p-3.5 space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>Khu vực này hiện chưa được hỗ trợ giao tận nơi</span>
                          </div>
                          <p className="text-2xs text-muted-foreground leading-relaxed pl-6">
                            <strong>{selectedWard}</strong> nằm ngoài bán kính phục vụ của Hanbi Sushi. Quý khách vui lòng chọn địa chỉ lân cận hoặc đặt nhận tại quầy (Take Away).
                          </p>
                        </div>
                      ) : shippingCalc ? (
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 sm:p-3.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                              <Store className="size-3.5 text-primary shrink-0" />
                              <span className="shrink-0">Chi nhánh giao:</span>
                              <span className="font-semibold text-primary truncate" title={shippingCalc.branch?.name}>
                                {shippingCalc.branch?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 font-mono font-bold text-primary text-sm shrink-0">
                              <span>{formatPrice(shippingCalc.fee)}</span>
                            </div>
                          </div>

                          {/* Nếu khu vực có nhiều hơn 1 chi nhánh hỗ trợ, cho khách đổi chi nhánh bằng Sheet đồng bộ */}
                          {currentWardInfo && currentWardInfo.supportedBranches.length > 1 && (
                            <div className="pt-2 border-t border-primary/10 flex items-center justify-between gap-2 text-2xs">
                              <span className="text-muted-foreground shrink-0">
                                {currentWardInfo.supportedBranches.length} chi nhánh có thể giao tới đây:
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsBranchModalOpen(true)}
                                className="h-7 px-2.5 text-2xs font-semibold text-primary border-primary/30 hover:bg-primary/10 rounded-lg shrink-0 gap-1 active:scale-95 transition-all"
                              >
                                <span>Đổi chi nhánh</span>
                                <ChevronRight className="size-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive font-medium py-1 text-xs">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>Không tìm thấy thông tin phục vụ cho khu vực này.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Địa chỉ chi tiết */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <HomeIcon className="size-3.5 text-muted-foreground" />
                      <span>Số nhà, tên đường, tòa nhà/căn hộ</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Ví dụ: 123/4 Nguyễn Trãi, Chung cư Flora, Tầng 5"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="rounded-xl h-11 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Mail className="size-3.5 text-muted-foreground" />
                      <span>Email (Tùy chọn, để nhận hóa đơn điện tử)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="rounded-xl h-11 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span>Ghi chú giao hàng & bảo quản món</span>
                    </label>
                    <Textarea
                      placeholder="Ví dụ: Giao lên tầng 3, gọi trước khi đến, đóng gói gừng riêng..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="rounded-xl resize-none text-base sm:text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!shippingCalc || calculatingFee || (currentWardInfo ? !currentWardInfo.isSupported : false)}
                  className="w-full h-12.5 rounded-xl text-sm sm:text-base font-semibold gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] transition-all"
                >
                  {currentWardInfo && !currentWardInfo.isSupported ? (
                    <span>Khu vực chưa hỗ trợ giao hàng</span>
                  ) : (
                    <>
                      <span>Tiếp tục chọn thanh toán</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* ==================== BƯỚC 2: CHỌN PHƯƠNG THỨC THANH TOÁN ==================== */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4 sm:space-y-6">
                {/* THẺ TÓM TẮT THÔNG TIN NGƯỜI NHẬN & ĐỊA CHỈ */}
                <div className="rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/5 p-3.5 sm:p-5 flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-primary uppercase tracking-wider block">
                      Địa chỉ nhận hàng (Đã xác nhận)
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-foreground">
                      {customerName} • {customerPhone}
                    </h3>
                    <p className="text-xs text-foreground/90 font-medium flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span>{streetAddress}, {selectedWard}, {selectedDistrict || currentWardInfo?.district}, TP.HCM</span>
                    </p>
                    {shippingCalc?.branch && (
                      <p className="text-[11px] text-muted-foreground">
                        Chi nhánh giao: <strong>{shippingCalc.branch.name}</strong> • Phí ship:{" "}
                        <strong className="text-primary font-mono">{formatPrice(currentShippingFee)}</strong>
                      </p>
                    )}
                    {note && (
                      <p className="text-xs text-foreground/80 italic pt-0.5">
                        Ghi chú: &ldquo;{note}&rdquo;
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="gap-1.5 rounded-xl text-xs h-7.5 sm:h-8 shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Sửa</span>
                  </Button>
                </div>

                {/* KHỐI CHỌN PHƯƠNG THỨC THANH TOÁN */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
                  <div className="pb-3 sm:pb-4 border-b border-border/60">
                    <h2 className="font-bold text-base sm:text-lg font-serif text-foreground">
                      Phương Thức Thanh Toán
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lựa chọn hình thức thanh toán thuận tiện nhất cho đơn giao hàng của bạn
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    {/* Cách 1: Tiền mặt khi nhận hàng (COD) */}
                    <label
                      className={`flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "CASH"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/70 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                          <Banknote className="size-5" />
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "CASH"}
                          onChange={() => setPaymentMethod("CASH")}
                          className="size-4 text-primary accent-primary"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          Trả tiền mặt trực tiếp cho shipper khi nhận được sushi tươi ngon
                        </span>
                      </div>
                    </label>

                    {/* Cách 2: VietQR */}
                    <label
                      className={`flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "VIETQR"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/70 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                          <QrCode className="size-5" />
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "VIETQR"}
                          onChange={() => setPaymentMethod("VIETQR")}
                          className="size-4 text-primary accent-primary"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          Chuyển khoản VietQR
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          Quét mã QR tự động điền số tài khoản, số tiền và nội dung
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* THÔNG TIN CHUYỂN KHOẢN VIETQR (NẾU CHỌN) */}
                  {paymentMethod === "VIETQR" && (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <QrCode className="size-4" />
                        <span>Thông tin tài khoản nhận chuyển khoản của quán:</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-center bg-card p-3 rounded-lg border border-border/60">
                        {paymentConfig?.qrImageUrl && (
                          <div className="relative size-24 rounded-lg overflow-hidden border bg-white p-1 shrink-0 flex items-center justify-center">
                            <SafeImage
                              src={paymentConfig.qrImageUrl}
                              alt="Mã QR"
                              fill
                              sizes="96px"
                              className="object-contain p-1"
                              fallbackSrc="/images/placeholder-dish.svg"
                              fallbackText="QR"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground flex-1 w-full">
                          <div>
                            <span>Ngân hàng:</span>
                            <p className="font-semibold text-foreground">
                              {paymentConfig?.bankName || PAYMENT_CONFIG.vietqr.bankName}
                            </p>
                          </div>
                          <div>
                            <span>Chủ tài khoản:</span>
                            <p className="font-semibold text-foreground uppercase">
                              {paymentConfig?.accountHolder || PAYMENT_CONFIG.vietqr.accountHolder}
                            </p>
                          </div>
                          <div>
                            <span>Số tài khoản:</span>
                            <p className="font-mono font-bold text-primary text-sm sm:text-xs">
                              {paymentConfig?.accountNumber || PAYMENT_CONFIG.vietqr.accountNumber}
                            </p>
                          </div>
                          <div>
                            <span>Số tiền thanh toán:</span>
                            <p className="font-mono font-bold text-foreground text-sm sm:text-xs">
                              {formatPrice(calculatedTotal)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        * Sau khi xác nhận đặt hàng, màn hình sẽ hiển thị mã QR kích thước đầy đủ cùng nội dung chuyển khoản theo mã đơn để bạn quét nhanh bằng ứng dụng ngân hàng.
                      </p>
                    </div>
                  )}
                </div>

                {/* CÁC NÚT ĐIỀU HƯỚNG BƯỚC 2 */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={isSubmitting}
                      className="hidden sm:inline-flex h-12.5 rounded-xl px-5 text-sm font-medium border-border/80 hover:bg-muted/40 transition-colors"
                    >
                      <ArrowLeft className="size-4 mr-1.5" />
                      <span>Quay lại địa chỉ</span>
                    </Button>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || calculatingFee || !shippingCalc}
                      className="w-full sm:flex-1 h-12.5 rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <span>Đang xử lý đơn hàng...</span>
                        </>
                      ) : (
                        <>
                          <PackageCheck className="size-4.5 stroke-[2.2]" />
                          <span>Xác nhận Đặt hàng</span>
                          <span className="h-4 w-px bg-primary-foreground/30 mx-0.5" />
                          <span className="font-mono font-bold tracking-tight">
                            {formatPrice(calculatedTotal)}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Nút quay lại tinh tế trên Mobile */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={isSubmitting}
                    className="sm:hidden w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground active:text-primary transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Quay lại chỉnh sửa địa chỉ</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-border/70">
                <h3 className="font-bold text-lg font-serif text-foreground">
                  Đơn Hàng Giao Tận Nơi
                </h3>
                <Badge variant="secondary" className="font-mono text-xs">
                  {items.length} món
                </Badge>
              </div>

              {/* Danh sách món thu gọn */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40 pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3">
                    <div className="relative size-12 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/50">
                      <SafeImage
                        src={item.imageUrl || "/images/placeholder-dish.svg"}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        fallbackSrc="/images/placeholder-dish.svg"
                        fallbackText={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chi tiết tính tiền */}
              <div className="pt-4 border-t border-border/70 space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền món ăn</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatPrice(subtotalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground items-baseline">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-4 text-primary" />
                    <span>Phí giao hàng:</span>
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {calculatingFee ? (
                      <Loader2 className="size-3.5 animate-spin inline" />
                    ) : !selectedWard ? (
                      <span className="text-muted-foreground text-xs font-sans">Chọn phường/xã</span>
                    ) : currentWardInfo && !currentWardInfo.isSupported ? (
                      <span className="text-destructive text-xs font-sans font-medium">Chưa hỗ trợ</span>
                    ) : (
                      formatPrice(currentShippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Hộp giữ lạnh & Đá gel</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Miễn phí
                  </span>
                </div>
                <div className="pt-3 border-t border-border/70 flex justify-between items-baseline">
                  <span className="font-bold text-base text-foreground">Tổng thanh toán</span>
                  <span className="text-2xl font-extrabold text-primary font-mono tracking-tight">
                    {formatPrice(calculatedTotal)}
                  </span>
                </div>
              </div>

              {/* Cam kết Giao hàng */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Truck className="size-4 text-primary shrink-0" />
                  <span>Cam kết giao hàng tươi ngon</span>
                </div>
                <p className="leading-relaxed">
                  Món ăn được chế biến ngay sau khi xác nhận đơn và vận chuyển bằng túi giữ nhiệt chuyên dụng để giữ trọn vẹn hương vị Nhật Bản.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODAL / SHEET TÌM KIẾM PHƯỜNG / XÃ ==================== */}
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        locations={locations}
        selectedWard={selectedWard}
        onSelectWard={(ward, district) => {
          setSelectedWard(ward);
          setSelectedDistrict(district);
          setSelectedBranchId("");
        }}
      />

      {/* ==================== MODAL / SHEET ĐỔI CHI NHÁNH PHỤC VỤ ==================== */}
      <BranchSelectionModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        currentWardInfo={currentWardInfo}
        selectedWard={selectedWard}
        selectedDistrict={selectedDistrict}
        selectedBranchId={selectedBranchId}
        defaultBranchId={shippingCalc?.branch?.id}
        onSelectBranchId={(branchId) => setSelectedBranchId(branchId)}
      />
    </div>
  );
}
