"use client";

import * as React from "react";
import Link from "next/link";
import {
  HomeIcon,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Utensils,
  Check,
  Layers,
} from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { Product, formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const priceNum =
    typeof product.sellingPrice === "string"
      ? parseFloat(product.sellingPrice)
      : product.sellingPrice;
  const unitPrice = isNaN(priceNum) ? 0 : priceNum;
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: unitPrice,
        imageUrl: product.imageUrl || undefined,
      },
      quantity
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);

    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`, {
      description: `Tổng: ${formatPrice(totalPrice)} • Đặt Take Away`,
    });
  };

  const isCombo = product.type === "COMBO";
  const comboItems = product.comboItemsAsParent || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 lg:pb-24">
      {/* ==================== BREADCRUMB ==================== */}
      <div className="border-b border-border/70 bg-muted/20 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HomeIcon className="size-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <Link
              href="/menu"
              className="hover:text-foreground transition-colors"
            >
              Thực đơn
            </Link>
            {product.category && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/50" />
                <Link
                  href={`/menu?category=${product.category.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ==================== MAIN PRODUCT SECTION ==================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* CỘT TRÁI: KHUNG ẢNH MÓN ĂN */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lg dark:shadow-2xl">
              <SafeImage
                src={product.imageUrl || "/images/placeholder-dish.svg"}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                fallbackSrc="/images/placeholder-dish.svg"
                fallbackText={product.name}
              />

              {/* Badges trên ảnh */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                {product.category && (
                  <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-border/60 shadow-sm text-xs px-3 py-1 font-medium">
                    {product.category.name}
                  </Badge>
                )}
                {isCombo ? (
                  <Badge className="bg-amber-500 text-white border-0 shadow-sm text-xs px-3 py-1 font-semibold flex items-center gap-1">
                    <Layers className="size-3" />
                    <span>Set Combo</span>
                  </Badge>
                ) : (
                  <Badge className="bg-primary/95 text-primary-foreground border-0 shadow-sm text-xs px-3 py-1 font-semibold flex items-center gap-1">
                    <Sparkles className="size-3" />
                    <span>Món Tươi Mới</span>
                  </Badge>
                )}
              </div>

              {/* Gradient che mờ chân ảnh */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT & ĐẶT MÓN */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Tên món */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">
                  {product.name}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-primary dark:text-red-400 font-medium tracking-wide">
                  HANBI SIGNATURE SUSHI • 厳選江戸前寿司
                </p>
              </div>

              {/* Giá bán */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    Đơn giá Take Away
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">
                    {formatPrice(unitPrice)}
                  </span>
                </div>
                {quantity > 1 && (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block mb-0.5">
                      Tổng tạm tính ({quantity} phần)
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-foreground font-mono">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Chi tiết Combo nếu là COMBO */}
              {isCombo && comboItems.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    <Layers className="size-4" />
                    <span>Các món thành phần trong set combo ({comboItems.length} món)</span>
                  </div>
                  <ul className="divide-y divide-border/40 text-sm">
                    {comboItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="py-2.5 flex items-center justify-between first:pt-1 last:pb-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="size-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-foreground">
                            {item.childProduct?.name || "Món ăn kèm"}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          x{item.quantity?.toString() || 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Giới thiệu hương vị chuẩn Nhật */}
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Món ăn được chế biến thủ công bởi các đầu bếp lành nghề tại Hanbi Sushi theo phong cách truyền thống Nhật Bản. Nguồn hải sản được kiểm định nghiêm ngặt về độ tươi ngon, kết hợp cùng giấm gạo đỏ ủ hạt cơm dẻo và wasabi tươi nguyên chất.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-foreground/80">
                  <Utensils className="size-3.5 text-primary" />
                  <span>Kèm theo: Gừng hồng chua ngọt Gari, nước tương Nhật Kikkoman & Wasabi tươi.</span>
                </div>
              </div>

              {/* Bộ chọn số lượng & Nút Thêm vào giỏ (Hiển thị trên Desktop) */}
              <div className="hidden lg:block pt-4 border-t border-border/70 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Số lượng:</span>
                  <div className="inline-flex items-center rounded-xl border border-border bg-card shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold font-mono text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                      className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1 gap-2.5 h-12 sm:h-13 rounded-xl sm:rounded-2xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {isAdded ? (
                      <>
                        <Check className="size-5" />
                        <span>Đã thêm vào giỏ!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="size-5" />
                        <span>Thêm vào giỏ hàng</span>
                      </>
                    )}
                  </Button>
                  <Link
                    href="/menu"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto h-12 sm:h-13 rounded-xl sm:rounded-2xl text-sm font-medium"
                    )}
                  >
                    Xem tiếp thực đơn
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MÓN ĂN GỢI Ý LIÊN QUAN ==================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/70">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase font-semibold tracking-widest text-primary dark:text-red-400 block mb-1">
                  GỢI Ý MÓN ĂN KÈM • おすすめ
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-foreground">
                  Món Ăn Cùng Danh Mục
                </h2>
              </div>
              <Link
                href="/menu"
                className="text-xs sm:text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => {
                const relPrice =
                  typeof rel.sellingPrice === "string"
                    ? parseFloat(rel.sellingPrice)
                    : rel.sellingPrice;
                const relSlug = rel.slug || rel.id;

                return (
                  <Link
                    key={rel.id}
                    href={`/menu/${relSlug}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                        <SafeImage
                          src={rel.imageUrl || "/images/placeholder-dish.svg"}
                          alt={rel.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                          fallbackSrc="/images/placeholder-dish.svg"
                          fallbackText={rel.name}
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono block mb-1">
                          {rel.sku}
                        </span>
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {rel.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 pt-0 flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-primary font-mono">
                        {formatPrice(relPrice)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        Chi tiết &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ==================== MOBILE STICKY BOTTOM ACTION BAR ==================== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.45)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          {/* Bộ chọn số lượng thu nhỏ */}
          <div className="inline-flex items-center rounded-xl border border-border bg-card shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Giảm số lượng"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold font-mono text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Tăng số lượng"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Nút Thêm vào giỏ hàng gọn gàng */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="flex-1 gap-2 h-11 rounded-xl text-sm font-semibold shadow-md active:scale-98 transition-all"
          >
            {isAdded ? (
              <>
                <Check className="size-4" />
                <span>Đã thêm!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" />
                <span>Thêm vào giỏ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
