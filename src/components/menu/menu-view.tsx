"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import { Category, Product, formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  UtensilsCrossed,
  RotateCw,
  Search,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Home as HomeIcon,
  X,
  SlidersHorizontal,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

export function MenuView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategoryParam = searchParams.get("category");
  const urlSearchParam = searchParams.get("q");

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [internalSearchQuery, setInternalSearchQuery] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addedProductId, setAddedProductId] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  const searchQuery =
    internalSearchQuery !== null ? internalSearchQuery : urlSearchParam || "";

  const addItem = useCartStore((state) => state.addItem);

  // Tải dữ liệu từ API Catalog
  React.useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/catalog/categories").then((r) => {
            if (!r.ok) throw new Error("Lỗi tải danh mục thực đơn");
            return r.json();
          }),
          fetch("/api/catalog/products").then((r) => {
            if (!r.ok) throw new Error("Lỗi tải danh sách món ăn");
            return r.json();
          }),
        ]);

        if (!ignore) {
          const loadedCategories: Category[] = catRes.data || [];
          const loadedProducts: Product[] = prodRes.data || [];

          setCategories(loadedCategories);
          setProducts(loadedProducts);

          // Nếu có query param category từ URL, chọn danh mục tương ứng
          if (urlCategoryParam) {
            const target = urlCategoryParam.toLowerCase();
            const matched = loadedCategories.find((c) => {
              const cname = c.name.toLowerCase();
              return (
                cname === target ||
                cname.includes(target) ||
                target.includes(cname) ||
                c.id === urlCategoryParam
              );
            });
            if (matched) {
              setSelectedCategoryId(matched.id);
            }
          }
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
          setError(msg);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [urlCategoryParam, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Lọc danh mục
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) {
        return false;
      }
      // Lọc từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchCat = p.category?.name.toLowerCase().includes(q);
        return matchName || matchSku || matchCat;
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  const pageNumbers = React.useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) {
        pages.push("ellipsis");
      }
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      if (safeCurrentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const gridEl = document.getElementById("menu-product-grid");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  const handleCategorySelect = (catId: string | null) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
    // Cập nhật URL mà không reload trang
    const params = new URLSearchParams(window.location.search);
    if (catId) {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    const newQuery = params.toString();
    router.replace(`/menu${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setInternalSearchQuery("");
    setCurrentPage(1);
    router.replace("/menu", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ==================== BREADCRUMB & BANNER TIÊU ĐỀ ==================== */}
      <div className="relative border-b border-border/70 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HomeIcon className="size-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium text-foreground">Thực đơn</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary dark:text-red-400">
                <span className="h-0.5 w-6 bg-primary dark:bg-red-500" />
                <span>CHỌN MÓN ONLINE • お持ち帰り注文</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl font-serif">
                Thực Đơn Trực Tuyến & Đặt Mang Đi
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Thưởng thức các lát Sashimi tươi rói, sushi Nigiri tinh tế, cơm cuộn thơm lừng
                cùng những món ăn nóng hổi chuẩn vị Nhật Bản. Thêm nhanh vào giỏ và nhận tại quầy.
              </p>
            </div>

            {/* Ô tìm kiếm món ăn nhanh */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm tên món, loại sushi..."
                  value={searchQuery}
                  onChange={(e) => {
                    setInternalSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-8 h-10 rounded-xl bg-card border-border/80 shadow-2xs focus-visible:ring-primary/40 text-xs sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setInternalSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* ==================== THANH LỌC DANH MỤC (PILLS CUỘN NGANG) ==================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar border-b border-border/50">
          <Button
            size="sm"
            variant={selectedCategoryId === null ? "default" : "secondary"}
            onClick={() => handleCategorySelect(null)}
            className="rounded-full text-xs font-semibold px-4 shrink-0 transition-all shadow-2xs border border-transparent hover:border-border/60"
          >
            <span>Tất cả món</span>
            {!isLoading && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedCategoryId === null
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground"
                }`}
              >
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
                onClick={() => handleCategorySelect(cat.id)}
                className="rounded-full text-xs font-semibold px-4 shrink-0 transition-all shadow-2xs border border-transparent hover:border-border/60"
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Thanh trạng thái bộ lọc (nếu có lọc tìm kiếm hoặc danh mục) */}
        {(selectedCategoryId !== null || searchQuery.trim() !== "") && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/30 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>
                Hiển thị <strong>{filteredProducts.length}</strong> món phù hợp
                {searchQuery.trim() && ` cho từ khóa "${searchQuery}"`}
                {totalPages > 1 && ` • Trang ${safeCurrentPage}/${totalPages}`}
              </span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
            >
              <span>Xóa bộ lọc</span>
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* ==================== TRẠNG THÁI LOADING ==================== */}
        {isLoading && (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-card p-0 shadow-2xs"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <Skeleton className="h-4 sm:h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 sm:h-3.5 w-1/2 rounded-md" />
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/40">
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-24 rounded-md" />
                    <Skeleton className="h-8 sm:h-9 w-14 sm:w-24 rounded-lg sm:rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== TRẠNG THÁI LỖI ==================== */}
        {!isLoading && error && (
          <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng kiểm tra kết nối với hệ thống backend API.
            </p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="mt-4 gap-2 rounded-xl"
            >
              <RotateCw className="size-4" />
              <span>Thử tải lại</span>
            </Button>
          </div>
        )}

        {/* ==================== DANH SÁCH MÓN ĂN ==================== */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <>
            <div
              id="menu-product-grid"
              className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 scroll-mt-24"
            >
              {paginatedProducts.map((product) => {
              const isAdded = addedProductId === product.id;
              const hasImage = Boolean(product.imageUrl);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    {/* Khung ảnh & Tên món dẫn đến trang chi tiết */}
                    <Link
                      href={`/menu/${product.slug || product.id}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-xl sm:rounded-t-2xl"
                    >
                      {/* Khung ảnh món ăn */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                        {hasImage ? (
                          <>
                            <SafeImage
                              src={product.imageUrl!}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                              loading="lazy"
                              fallbackSrc="/images/placeholder-dish.svg"
                              fallbackText={product.name}
                            />
                            <div className="absolute inset-x-0 top-0 h-12 sm:h-16 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />
                          </>
                        ) : (
                          <div className="relative flex size-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10 p-3 sm:p-6 text-center">
                            <div className="absolute -right-6 -bottom-6 size-20 sm:size-28 rounded-full border border-primary/10 bg-primary/5" />
                            <div className="absolute -left-6 -top-6 size-16 sm:size-24 rounded-full border border-amber-500/10 bg-amber-500/5" />

                            <div className="relative flex size-10 sm:size-14 items-center justify-center rounded-full bg-card/90 shadow-xs ring-1 ring-border/80 text-primary transition-transform duration-300 group-hover:scale-110">
                              <UtensilsCrossed className="size-4 sm:size-6 stroke-[1.75]" />
                            </div>
                            <span className="relative mt-2 text-[11px] sm:text-xs font-semibold text-foreground/90 tracking-wide line-clamp-1">
                              {product.name}
                            </span>
                            <span className="relative text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 hidden xs:inline sm:inline">
                              Món chuẩn vị Nhật Bản
                            </span>
                          </div>
                        )}

                        {/* Badges trên ảnh */}
                        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-wrap gap-1 sm:gap-1.5 z-10">
                          {product.type === "COMBO" && (
                            <Badge className="bg-amber-500 text-white font-bold text-[9px] sm:text-[11px] px-1.5 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full shadow-xs border-none flex items-center gap-1">
                              <Sparkles className="size-2.5 sm:size-3" />
                              <span>Combo</span>
                            </Badge>
                          )}
                          {product.category?.name && (
                            <Badge
                              variant="secondary"
                              className="bg-background/90 dark:bg-card/90 backdrop-blur-md text-[9px] sm:text-[11px] font-medium text-foreground px-1.5 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full shadow-xs border border-border/60"
                            >
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Thông tin món */}
                      <div className="p-3 sm:p-5 pb-2 sm:pb-3">
                        <h3 className="text-xs sm:text-base lg:text-lg font-bold text-foreground line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors tracking-tight leading-snug">
                          {product.name}
                        </h3>
                        {product.sku && (
                          <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/70">
                            {product.sku}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Giá và nút Thêm vào giỏ */}
                  <div className="p-3 sm:p-5 pt-0">
                    <div className="flex items-center justify-between gap-1.5 border-t border-border/50 pt-2.5 sm:pt-3">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Giá món
                        </span>
                        <span className="text-xs sm:text-base lg:text-lg font-extrabold text-primary tracking-tight truncate">
                          {formatPrice(product.sellingPrice)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-8 sm:h-9.5 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl font-semibold gap-1 shrink-0 transition-all shadow-xs hover:shadow-md active:scale-95"
                        variant={isAdded ? "outline" : "default"}
                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="size-3.5 sm:size-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                            <span className="text-[11px] sm:text-xs">Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-3.5 sm:size-4 stroke-[2.5]" />
                            <span className="text-[11px] sm:text-xs">Chọn</span>
                            <span className="hidden sm:inline text-xs">món</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thanh điều hướng phân trang */}
          {totalPages > 1 && (
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                Hiển thị món{" "}
                <strong className="text-foreground font-semibold">
                  {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-foreground font-semibold">
                  {Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems)}
                </strong>{" "}
                trong tổng số{" "}
                <strong className="text-foreground font-semibold">
                  {totalItems}
                </strong>{" "}
                món
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === 1}
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl gap-1 text-xs font-medium border-border/80 shadow-2xs hover:bg-muted disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Trang trước</span>
                </Button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, idx) => {
                    if (page === "ellipsis") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1.5 sm:px-2 py-1 text-xs text-muted-foreground select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    const isCurrent = page === safeCurrentPage;
                    return (
                      <Button
                        key={page}
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={`size-8.5 sm:size-9 rounded-xl p-0 text-xs font-semibold shadow-2xs transition-all ${
                          isCurrent
                            ? "pointer-events-none"
                            : "border-border/80 hover:bg-muted"
                        }`}
                        aria-label={`Trang ${page}`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl gap-1 text-xs font-medium border-border/80 shadow-2xs hover:bg-muted disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <span className="hidden sm:inline">Trang sau</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

        {/* ==================== TRẠNG THÁI KHÔNG TÌM THẤY MÓN ==================== */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Không tìm thấy món ăn phù hợp
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {searchQuery
                ? `Không có kết quả nào cho "${searchQuery}". Bạn vui lòng thử từ khóa khác.`
                : "Danh mục này hiện chưa có món ăn khả dụng."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-5 rounded-xl"
            >
              Xem tất cả món
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
