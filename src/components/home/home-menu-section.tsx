"use client";

import * as React from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Category,
  Product,
  formatPrice,
} from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  UtensilsCrossed,
  RotateCw,
  Search,
  Check,
  Sparkles,
} from "lucide-react";

export function HomeMenuSection() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addedProductId, setAddedProductId] = React.useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/catalog/categories").then((r) => {
          if (!r.ok) throw new Error("Lỗi tải danh mục");
          return r.json();
        }),
        fetch("/api/catalog/products").then((r) => {
          if (!r.ok) throw new Error("Lỗi tải sản phẩm");
          return r.json();
        }),
      ]);

      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/catalog/categories").then((r) => {
            if (!r.ok) throw new Error("Lỗi tải danh mục");
            return r.json();
          }),
          fetch("/api/catalog/products").then((r) => {
            if (!r.ok) throw new Error("Lỗi tải sản phẩm");
            return r.json();
          }),
        ]);

        if (!ignore) {
          setCategories(catRes.data || []);
          setProducts(prodRes.data || []);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Không thể kết nối đến máy chủ"
          );
          setIsLoading(false);
        }
      }
    }

    initialFetch();

    return () => {
      ignore = true;
    };
  }, []);

  // Lắng nghe sự kiện chọn danh mục từ phần Thực đơn đặc sắc
  React.useEffect(() => {
    const handleSelectCategory = (event: Event) => {
      const customEvent = event as CustomEvent<{ target?: string }>;
      const target = customEvent.detail?.target?.toLowerCase();
      if (!target || target === "all") {
        setSelectedCategoryId(null);
        return;
      }

      setCategories((currentCategories) => {
        const matched = currentCategories.find((c) => {
          const cname = c.name.toLowerCase();
          return (
            cname === target ||
            cname.includes(target) ||
            target.includes(cname)
          );
        });

        setSelectedCategoryId(matched ? matched.id : null);
        return currentCategories;
      });
    };

    window.addEventListener("sushi-select-category", handleSelectCategory);
    return () => {
      window.removeEventListener("sushi-select-category", handleSelectCategory);
    };
  }, []);

  // Lọc sản phẩm theo danh mục đang chọn
  const filteredProducts = React.useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const handleAddToCart = (product: Product) => {
    const priceNum =
      typeof product.sellingPrice === "string"
        ? parseFloat(product.sellingPrice)
        : product.sellingPrice;

    addItem({
      id: product.id,
      name: product.name,
      price: isNaN(priceNum) ? 0 : priceNum,
      imageUrl: product.imageUrl || undefined,
    });

    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((prev) => (prev === product.id ? null : prev));
    }, 1200);

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
      description: `${formatPrice(product.sellingPrice)} • Đặt Take Away`,
    });
  };

  return (
    <section id="thuc-don" className="scroll-mt-20 py-12 md:py-16 bg-muted/20">
      <div id="menu-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề mục thực đơn */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-0.5 w-6 bg-primary" />
              <span>CHỌN MÓN ONLINE • お持ち帰り注文</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
              Thực Đơn Trực Tuyến & Đặt Mang Đi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn món sushi tươi ngon, tùy chỉnh số lượng và thêm vào giỏ để nhận tại quầy.
            </p>
          </div>

          <Button variant="outline" asChild size="sm" className="shrink-0 gap-1.5">
            <Link href="/menu">
              <span>Xem toàn bộ menu</span>
            </Link>
          </Button>
        </div>

        {/* Thanh lọc danh mục (Pills / Tabs cuộn ngang) */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          <Button
            size="sm"
            variant={selectedCategoryId === null ? "default" : "secondary"}
            onClick={() => setSelectedCategoryId(null)}
            className="rounded-full text-xs font-semibold px-4 shrink-0 transition-all shadow-2xs border border-transparent hover:border-border/60"
          >
            <span>Tất cả món</span>
            {!isLoading && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategoryId === null
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/15 text-muted-foreground"
              }`}>
                {products.length}
              </span>
            )}
          </Button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={isSelected ? "default" : "secondary"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="rounded-full text-xs font-semibold px-4 shrink-0 transition-all shadow-2xs border border-transparent hover:border-border/60"
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* ==================== TRẠNG THÁI LOADING ==================== */}
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xs">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 sm:p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-3.5 w-1/2 rounded-md" />
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== TRẠNG THÁI LỖI ==================== */}
        {!isLoading && error && (
          <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng kiểm tra kết nối với hệ thống backend API.
            </p>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="mt-4 gap-2 rounded-xl"
            >
              <RotateCw className="size-4" />
              <span>Thử lại</span>
            </Button>
          </div>
        )}

        {/* ==================== DANH SÁCH SẢN PHẨM ==================== */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isAdded = addedProductId === product.id;
              const hasImage = Boolean(product.imageUrl);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    {/* Khung ảnh món ăn */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                      {hasImage ? (
                        <>
                          <SafeImage
                            src={product.imageUrl!}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                            loading="lazy"
                            fallbackSrc="/images/placeholder-dish.svg"
                            fallbackText={product.name}
                          />
                          {/* Lớp gradient nhẹ phủ trên cùng để badge luôn nổi bật */}
                          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />
                        </>
                      ) : (
                        /* Trạng thái chưa có ảnh: Thiết kế thủ công nghệ thuật Nhật Bản */
                        <div className="relative flex size-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 p-6 text-center">
                          <div className="absolute -right-6 -bottom-6 size-28 rounded-full border border-primary/10 bg-primary/5" />
                          <div className="absolute -left-6 -top-6 size-24 rounded-full border border-amber-500/10 bg-amber-500/5" />
                          
                          <div className="relative flex size-14 items-center justify-center rounded-full bg-card/90 shadow-xs ring-1 ring-border/80 text-primary transition-transform duration-300 group-hover:scale-110">
                            <UtensilsCrossed className="size-6 stroke-[1.75]" />
                          </div>
                          <span className="relative mt-2.5 text-xs font-semibold text-foreground/90 tracking-wide line-clamp-1">
                            {product.name}
                          </span>
                          <span className="relative text-[10px] text-muted-foreground mt-0.5">
                            Món chuẩn vị Nhật Bản
                          </span>
                        </div>
                      )}

                      {/* Badges trên ảnh */}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
                        {product.type === "COMBO" && (
                          <Badge
                            className="bg-amber-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs border-none flex items-center gap-1"
                          >
                            <Sparkles className="size-3" />
                            <span>Combo</span>
                          </Badge>
                        )}
                        {product.category?.name && (
                          <Badge
                            variant="secondary"
                            className="bg-background/90 dark:bg-card/90 backdrop-blur-md text-[11px] font-medium text-foreground px-2.5 py-0.5 rounded-full shadow-xs border border-border/60"
                          >
                            {product.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Thông tin món */}
                    <div className="p-4 sm:p-5 pb-3">
                      <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Giá và nút Thêm vào giỏ */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Giá món
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight whitespace-nowrap">
                          {formatPrice(product.sellingPrice)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-9.5 px-3.5 rounded-xl font-semibold gap-1.5 shrink-0 transition-all shadow-xs hover:shadow-md active:scale-95"
                        variant={isAdded ? "outline" : "default"}
                      >
                        {isAdded ? (
                          <>
                            <Check className="size-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                            <span className="text-xs">Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-4 stroke-[2.5]" />
                            <span className="text-xs">Chọn món</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== TRẠNG THÁI KHÔNG CÓ MÓN ==================== */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Chưa có món trong danh mục này
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Món ăn đang được cập nhật. Bạn vui lòng chọn danh mục khác hoặc quay lại sau nhé.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
              className="mt-4"
            >
              Xem tất cả món
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
