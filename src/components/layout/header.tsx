"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Phone,
  UtensilsCrossed,
  Home as HomeIcon,
  Package,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AccountDropdown } from "@/components/layout/account-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/cart-store";
import { useRecentOrders } from "@/lib/recent-orders";
import { useStoreConfig } from "@/hooks/use-store-config";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/", icon: HomeIcon },
  { label: "Thực đơn", href: "/menu", icon: UtensilsCrossed },
  { label: "Tra cứu đơn", href: "/track-order", icon: Package },
  { label: "Liên hệ", href: "#footer-contact", icon: Phone },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Tránh hydration mismatch bằng useSyncExternalStore
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { customerOrderingEnabled, contactPhone, contactPhoneTel } =
    useStoreConfig();

  const totalItems = useCartStore((state) => state.totalItems());
  const recentOrders = useRecentOrders();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = isMounted ? (theme === "system" ? resolvedTheme : theme) : "dark";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  const isMinimalMobile =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/order-success" ||
    (pathname.startsWith("/menu/") && pathname !== "/menu");

  // Theo dõi hướng cuộn trang để tự động ẩn Header khi cuộn xuống và hiện lại khi cuộn lên trên mobile
  const isScrollVisible = useScrollDirection({ threshold: 12 });
  const shouldShowHeader = isScrollVisible || isSearchOpen || mobileMenuOpen;

  return (
    <header
      suppressHydrationWarning
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-transform duration-300 ease-in-out will-change-transform",
        isMounted && isMinimalMobile && "hidden sm:block",
        !shouldShowHeader && "-translate-y-full md:translate-y-0"
      )}
    >
      <div className="mx-auto flex h-18 sm:h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ===================== KHỐI TRÁI: LOGO ===================== */}
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-center transition-opacity hover:opacity-90"
            aria-label="Về trang chủ"
          >
            <div className="relative flex h-11 w-44 sm:h-13 sm:w-56 md:h-14 md:w-64 items-center justify-start transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.svg"
                alt="Sushi Platform Logo"
                width={280}
                height={58}
                priority
                unoptimized
                className="h-full w-auto max-h-11 sm:max-h-13 md:max-h-14 object-contain object-left"
              />
            </div>
          </Link>
        </div>

        {/* ===================== KHỐI GIỮA: NAVIGATION (DESKTOP) ===================== */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : !item.href.startsWith("#") && pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-[15px] lg:text-base font-medium transition-colors tracking-wide",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-4 -bottom-[19px] sm:-bottom-[20px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ===================== KHỐI PHẢI: ACTIONS ===================== */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ô tìm kiếm mở rộng (Desktop) */}
          <div className="relative hidden lg:block">
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center animate-in fade-in zoom-in-95 duration-200"
              >
                <Input
                  type="search"
                  placeholder="Tìm sushi, sashimi, combo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-64 pr-8 text-sm h-9 bg-muted/40 focus:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Đóng tìm kiếm"
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                title="Tìm kiếm món ăn"
                aria-label="Tìm kiếm"
              >
                <Search className="size-5" />
              </Button>
            )}
          </div>

          {/* Nút tìm kiếm (Mobile / Tablet) */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Tìm kiếm món ăn"
              aria-label="Tìm kiếm"
              className="size-9"
            >
              <Search className="size-5" />
            </Button>
          </div>

          {/* Nút chuyển đổi màu (Theme Toggle: Sun / Moon vector icon - ẩn trên mobile nhỏ vì đã có trong drawer menu) */}
          <ThemeToggle className="hidden sm:inline-flex size-9" />

          {/* Logo giỏ hàng (khi bật đặt món) HOẶC Nút gọi điện hotline (khi tắt đặt món) */}
          {!isMounted || customerOrderingEnabled ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              asChild
              title="Giỏ hàng của bạn"
            >
              <Link href="/cart" aria-label="Giỏ hàng">
                <ShoppingBag className="size-5" />
                {isMounted && totalItems > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 flex size-4 sm:size-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </Link>
            </Button>
          ) : (
            <a
              suppressHydrationWarning
              href={`tel:${isMounted ? contactPhoneTel : "19006868"}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-colors"
              title={`Hotline đặt món: ${isMounted ? contactPhone : "1900 6868"}`}
            >
              <Phone className="size-3.5" />
              <span className="hidden sm:inline">
                Hotline: {isMounted ? contactPhone : "1900 6868"}
              </span>
              <span className="sm:hidden">Gọi món</span>
            </a>
          )}

          {/* Menu Dropdown Tài khoản & Đơn mua kiểu Shopee (Desktop) */}
          <div className="hidden sm:inline-flex">
            <AccountDropdown />
          </div>

          {/* Hamburger menu (Mobile) */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mở menu điều hướng"
                  className="size-9"
                >
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[82vw] max-w-xs p-0 flex flex-col justify-between"
              >
                {/* Phần đầu Drawer: Logo + Danh sách điều hướng */}
                <div className="p-5">
                  <SheetHeader className="p-0 text-left">
                    <div className="flex items-center justify-between pb-4 pr-6 border-b border-border/70">
                      <div className="relative flex h-10 w-44 items-center justify-start">
                        <Image
                          src="/images/logo.svg"
                          alt="Sushi Platform"
                          width={220}
                          height={46}
                          unoptimized
                          className="h-full w-auto max-h-10 object-contain object-left"
                        />
                      </div>
                      <SheetTitle className="sr-only">
                        Menu Điều Hướng
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  <nav className="mt-5 flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : !item.href.startsWith("#") &&
                            pathname.startsWith(item.href);
                      const isTrackOrder = item.href === "/track-order";

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-foreground/90 hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                          </span>
                          {isTrackOrder && isMounted && recentOrders.length > 0 && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[11px] font-semibold",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {recentOrders.length}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Phần đáy Drawer: Chỉ để Chuyển giao diện & Hotline tinh gọn */}
                <div className="p-5 pt-4 border-t border-border/70 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Giao diện
                    </span>
                    <div className="inline-flex items-center rounded-lg bg-muted p-0.5 border border-border/60">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                          currentTheme === "light"
                            ? "bg-background text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Sun className="size-3.5" />
                        <span>Sáng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                          currentTheme === "dark"
                            ? "bg-background text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Moon className="size-3.5" />
                        <span>Tối</span>
                      </button>
                    </div>
                  </div>

                  <a
                    suppressHydrationWarning
                    href={`tel:${isMounted ? contactPhoneTel : "0988888888"}`}
                    className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="size-3.5 text-primary" />
                      <span>Hotline đặt món</span>
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {isMounted ? contactPhone : "0988 888 888"}
                    </span>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm thả xuống trên Mobile khi bấm nút search */}
      {isSearchOpen && (
        <div className="border-t border-border bg-background p-3 lg:hidden animate-in slide-in-from-top-2 duration-200">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm món sushi yêu thích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-9 h-10 w-full"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4">
              Tìm
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(false)}
              className="h-10 w-10 shrink-0"
              aria-label="Đóng tìm kiếm"
            >
              <X className="size-5" />
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
