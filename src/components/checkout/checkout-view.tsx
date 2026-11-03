"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  ChevronRight,
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
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, createOrder } from "@/lib/api";
import { PAYMENT_CONFIG, VIETNAM_PHONE_REGEX } from "@/config/site.config";
import { SafeImage } from "@/components/ui/safe-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CheckoutView() {
  const router = useRouter();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { items, clearCart, totalPrice } = useCartStore();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [showMobileSummary, setShowMobileSummary] = React.useState(false);

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "VIETQR">("CASH");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
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

  const calculatedTotal = totalPrice();

  // Validate Bước 1 và chuyển sang Bước 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    const nameClean = customerName.trim();
    const phoneClean = customerPhone.trim();

    if (!nameClean) {
      toast.error("Vui lòng nhập họ và tên của bạn");
      return;
    }

    if (!VIETNAM_PHONE_REGEX.test(phoneClean)) {
      toast.error("Số điện thoại không hợp lệ (cần 10 chữ số chuẩn Việt Nam)");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Xác nhận đặt hàng ở Bước 2
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const fullNote = [
        paymentMethod === "VIETQR" ? "Thanh toán: Chuyển khoản VietQR" : "Thanh toán: Tiền mặt/Thẻ tại quầy",
        note.trim() ? `Ghi chú: ${note.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        note: fullNote,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      });

      clearCart();
      toast.success("Đặt món thành công!");

      const params = new URLSearchParams({
        code: res.order.orderCode,
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
      {/* ==================== BREADCRUMB ==================== */}
      <div className="border-b border-border/70 bg-muted/20 py-4">
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
            <span className="font-medium text-foreground">Thanh toán Take Away</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* ==================== ACCORDION TÓM TẮT ĐƠN HÀNG (MOBILE) ==================== */}
        <div className="lg:hidden mb-6 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full p-4 flex items-center justify-between text-xs font-semibold bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-primary font-medium">
              <ShoppingBag className="size-4" />
              <span>Đơn hàng ({items.length} món)</span>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200",
                  showMobileSummary && "rotate-180"
                )}
              />
            </div>
            <span className="font-mono text-sm font-extrabold text-foreground">
              {formatPrice(calculatedTotal)}
            </span>
          </button>

          {showMobileSummary && (
            <div className="p-4 pt-3 border-t border-border/60 space-y-3">
              <div className="max-h-60 overflow-y-auto divide-y divide-border/40 pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3">
                    <div className="relative size-11 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/50">
                      <SafeImage
                        src={item.imageUrl || "/images/placeholder-dish.svg"}
                        alt={item.name}
                        fill
                        sizes="44px"
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

              <div className="pt-3 border-t border-border/60 flex justify-between items-baseline text-xs">
                <span className="text-muted-foreground">Bao bì & Đá gel</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Miễn phí
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================== STEPPER THANH TIẾN TRÌNH ==================== */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 pb-6 mb-8 border-b border-border/70">
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
            <span>
              <span className="sm:hidden">1. Thông tin</span>
              <span className="hidden sm:inline">1. Thông tin người nhận</span>
            </span>
          </button>

          <div className="h-px w-8 sm:w-16 bg-border shrink-0" />

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
            <span>
              <span className="sm:hidden">2. Thanh toán</span>
              <span className="hidden sm:inline">2. Phương thức thanh toán</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* CỘT TRÁI: FORM THEO TỪNG BƯỚC */}
          <div className="lg:col-span-7">
            {/* ==================== BƯỚC 1: NHẬP THÔNG TIN ==================== */}
            {step === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="pb-4 border-b border-border/60">
                    <h2 className="font-bold text-base sm:text-lg font-serif text-foreground">
                      Thông Tin Người Nhận Món
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dùng để gọi tên và xác nhận đơn khi bạn ghé nhận tại quầy
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Họ và tên</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <span>Số điện thoại</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
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
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span>Ghi chú cho bếp (Tùy chọn)</span>
                    </label>
                    <Textarea
                      placeholder="Ví dụ: Cho thêm wasabi, đóng gói gừng riêng, không ăn cay..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 sm:h-13 rounded-2xl text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Tiếp tục chọn thanh toán</span>
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}

            {/* ==================== BƯỚC 2: CHỌN PHƯƠNG THỨC THANH TOÁN ==================== */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                {/* THẺ TÓM TẮT THÔNG TIN NGƯỜI NHẬN */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                      Người nhận món (Đã xác nhận)
                    </span>
                    <h3 className="font-bold text-base text-foreground">
                      {customerName} • {customerPhone}
                    </h3>
                    {customerEmail && (
                      <p className="text-xs text-muted-foreground">{customerEmail}</p>
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
                    className="gap-1.5 rounded-xl text-xs h-8 shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Sửa</span>
                  </Button>
                </div>

                {/* KHỐI CHỌN PHƯƠNG THỨC THANH TOÁN */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="pb-4 border-b border-border/60">
                    <h2 className="font-bold text-base sm:text-lg font-serif text-foreground">
                      Phương Thức Thanh Toán
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lựa chọn hình thức thanh toán thuận tiện nhất cho bạn
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Cách 1: Tại quầy */}
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
                          Thanh toán tại quầy
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          Tiền mặt, thẻ ngân hàng hoặc quẹt thẻ khi bạn đến nhận món
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
                          Quét mã QR chuyển khoản ngân hàng nhanh 24/7
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* THÔNG TIN CHUYỂN KHOẢN VIETQR (KHI CHỌN) */}
                  {paymentMethod === "VIETQR" && (
                    <div className="mt-4 p-4 rounded-xl border border-border/80 bg-muted/30 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <QrCode className="size-4 text-primary" />
                        <span>Thông tin tài khoản nhận chuyển khoản:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                        <div>
                          <span>Ngân hàng:</span>
                          <p className="font-semibold text-foreground">
                            {PAYMENT_CONFIG.vietqr.bankName}
                          </p>
                        </div>
                        <div>
                          <span>Chủ tài khoản:</span>
                          <p className="font-semibold text-foreground">
                            {PAYMENT_CONFIG.vietqr.accountHolder}
                          </p>
                        </div>
                        <div>
                          <span>Số tài khoản:</span>
                          <p className="font-mono font-bold text-primary">
                            {PAYMENT_CONFIG.vietqr.accountNumber}
                          </p>
                        </div>
                        <div>
                          <span>Số tiền:</span>
                          <p className="font-mono font-bold text-foreground">
                            {formatPrice(calculatedTotal)}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/50">
                        * Bạn cũng có thể quét mã QR động tại quầy thu ngân khi tới nhận món.
                      </p>
                    </div>
                  )}
                </div>

                {/* CÁC NÚT ĐIỀU HƯỚNG BƯỚC 2 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm font-medium order-2 sm:order-1"
                  >
                    <ArrowLeft className="size-4 mr-1.5" />
                    <span>Quay lại thông tin</span>
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="flex-1 h-12 sm:h-13 rounded-xl sm:rounded-2xl text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        <span>Đang xử lý đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác nhận Đặt hàng • {formatPrice(calculatedTotal)}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (CHỈ HIỂN THỊ TRÊN DESKTOP, MOBILE DÙNG ACCORDION Ở ĐẦU TRANG) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-border/70">
                <h3 className="font-bold text-lg font-serif text-foreground">
                  Đơn Hàng Của Bạn
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
                  <span>Tạm tính</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatPrice(calculatedTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí đóng hộp & Đá gel giữ lạnh</span>
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

              {/* Cam kết Take Away */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <PackageCheck className="size-4 text-primary shrink-0" />
                  <span>Cam kết chuẩn chất lượng</span>
                </div>
                <p>
                  Đơn hàng được chuẩn bị kỹ lưỡng và chỉ bắt đầu chế biến khi nhận đơn để bảo toàn trọn vẹn độ tươi ngon của hải sản.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
