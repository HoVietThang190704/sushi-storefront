"use client";

import * as React from "react";
import Link from "next/link";
import {
  HomeIcon,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  ShoppingBag,
  Utensils,
  Check,
  Phone,
} from "lucide-react";
import { useStoreConfig } from "@/hooks/use-store-config";
import { SafeImage } from "@/components/ui/safe-image";
import { Product, formatPrice, parsePrice } from "@/lib/api";
import { useProducts } from "@/hooks/use-queries";
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
  product: initialProduct,
  relatedProducts,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tự động đồng bộ dữ liệu món ăn theo thời gian thực khi Admin chỉnh sửa (tên, giá, kèm theo, mô tả)
  const { data: allProducts } = useProducts();
  const product = React.useMemo(() => {
    const live = allProducts?.find((p) => p.id === initialProduct.id);
    if (!live) return initialProduct;
    return {
      ...initialProduct,
      ...live,
      comboItemsAsParent:
        live.comboItemsAsParent ?? initialProduct.comboItemsAsParent,
    };
  }, [allProducts, initialProduct]);

  const { customerOrderingEnabled, contactPhone, contactPhoneTel } =
    useStoreConfig();
  const addItem = useCartStore((state) => state.addItem);
  const totalCartItems = useCartStore((state) => state.totalItems());

  const unitPrice = parsePrice(product.sellingPrice);
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
      description: `Tổng: ${formatPrice(totalPrice)} • Giao tận nơi TP.HCM`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 lg:pb-24">
      {/* ==================== BREADCRUMB (DESKTOP) ==================== */}
      <div className="hidden sm:block border-b border-border/70 bg-muted/20 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
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

      {/* ==================== APP-LIKE TOP BAR (MOBILE) ==================== */}
      <div className="sm:hidden border-b border-border/70 bg-card/95 backdrop-blur-md px-3 h-14 sticky top-0 z-40 flex items-center justify-between gap-2">
        <Link
          href={product.category ? `/menu?category=${product.category.id}` : "/menu"}
          className="size-10 flex items-center justify-center -ml-1 text-foreground/80 hover:text-foreground active:scale-90 transition-all rounded-full shrink-0"
          aria-label="Quay lại thực đơn"
        >
          <ChevronLeft className="size-6 stroke-[2]" />
        </Link>
        <h1 className="font-semibold text-sm text-foreground tracking-tight truncate select-none">
          {product.name}
        </h1>
        <div className="size-10 flex items-center justify-center -mr-1 shrink-0">
          {customerOrderingEnabled && (
            <Link
              href="/cart"
              className="relative size-9 flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="size-5" />
              {isMounted && totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {totalCartItems > 99 ? "99+" : totalCartItems}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* ==================== MAIN PRODUCT SECTION ==================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* CỘT TRÁI: KHUNG ẢNH MÓN ĂN */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-2xl border border-border/70 bg-card">
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
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                {product.category && (
                  <Badge className="bg-background/90 backdrop-blur-md text-foreground border border-border/60 shadow-2xs text-xs px-2.5 py-0.5 font-medium">
                    {product.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT & ĐẶT MÓN */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Tên món & Giá bán phẳng, tinh gọn */}
              <div className="pb-4 border-b border-border/60">
                <h1 className="text-xl sm:text-3xl font-bold font-serif text-foreground tracking-tight">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
                    {product.sku}
                  </p>
                )}

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                    {formatPrice(unitPrice)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      (Tạm tính {quantity} phần:{" "}
                      <strong className="text-foreground font-semibold">
                        {formatPrice(totalPrice)}
                      </strong>
                      )
                    </span>
                  )}
                </div>
              </div>

              {/* Giới thiệu hương vị & Gia vị ăn kèm (Cấu hình động từ Admin) */}
              <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  {product.description?.trim()
                    ? product.description
                    : "Món ăn được chế biến thủ công bởi các đầu bếp lành nghề tại Hanbi Sushi theo phong cách truyền thống Nhật Bản. Nguồn hải sản được kiểm định nghiêm ngặt về độ tươi ngon, kết hợp cùng giấm gạo đỏ ủ hạt cơm dẻo và wasabi tươi nguyên chất."}
                </p>
                {product.accompaniments && product.accompaniments.trim() !== "" && (
                  <div className="flex items-start gap-2 pt-1 text-xs text-foreground/85">
                    <Utensils className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Kèm theo: {product.accompaniments.trim()}</span>
                  </div>
                )}
              </div>

              {/* Bộ chọn số lượng & Nút Thêm vào giỏ (Hiển thị trên Desktop) */}
              <div className="hidden lg:block pt-4 border-t border-border/70 space-y-4">
                {customerOrderingEnabled ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
                      Website hiện đang tạm ngưng đặt hàng trực tuyến. Quý khách vui lòng bấm nút bên dưới để gọi hotline nhà hàng đặt món giao tận nơi.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`tel:${contactPhoneTel}`}
                        className={cn(
                          buttonVariants({ variant: "default", size: "lg" }),
                          "flex-1 gap-2.5 h-12 sm:h-13 rounded-xl sm:rounded-2xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
                        )}
                      >
                        <Phone className="size-5" />
                        <span>Gọi đặt món: {contactPhone}</span>
                      </a>
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MÓN ĂN GỢI Ý LIÊN QUAN ==================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-border/60">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold font-serif text-foreground">
                Món cùng danh mục
              </h2>
              <Link
                href="/menu"
                className="text-xs sm:text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.slice(0, 4).map((rel) => {
                const relPrice = parsePrice(rel.sellingPrice);
                const relSlug = rel.slug || rel.id;

                return (
                  <Link
                    key={rel.id}
                    href={`/menu/${relSlug}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all duration-200"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                        <SafeImage
                          src={rel.imageUrl || "/images/placeholder-dish.svg"}
                          alt={rel.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          fallbackSrc="/images/placeholder-dish.svg"
                          fallbackText={rel.name}
                        />
                      </div>
                      <div className="p-3 sm:p-4 pb-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {rel.name}
                        </h3>
                        {rel.sku && (
                          <span className="text-[11px] text-muted-foreground font-sans line-clamp-1 block mt-0.5">
                            {rel.sku}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 pt-1 flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-primary">
                        {formatPrice(relPrice)}
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
          {customerOrderingEnabled ? (
            <>
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
            </>
          ) : (
            <a
              href={`tel:${contactPhoneTel}`}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "flex-1 gap-2 h-11 rounded-xl text-sm font-semibold shadow-md active:scale-98 transition-all"
              )}
            >
              <Phone className="size-4" />
              <span>Gọi hotline đặt món ({contactPhone})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
