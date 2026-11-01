"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  Phone,
  MapPin,
  UtensilsCrossed,
  Home as HomeIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/", icon: HomeIcon },
  { label: "Thực đơn", href: "/menu", icon: UtensilsCrossed },
  { label: "Chi nhánh", href: "/branches", icon: MapPin },
  { label: "Liên hệ", href: "/contact", icon: Phone },
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

  const totalItems = useCartStore((state) => state.totalItems());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ===================== KHỐI TRÁI: LOGO ===================== */}
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-center transition-opacity hover:opacity-90"
            aria-label="Về trang chủ"
          >
            <div className="relative flex h-11 w-40 sm:w-52 items-center justify-start transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.svg"
                alt="Sushi Platform Logo"
                width={208}
                height={44}
                priority
                unoptimized
                className="h-full w-auto max-h-11 object-contain object-left"
              />
            </div>
          </Link>
        </div>

        {/* ===================== KHỐI GIỮA: NAVIGATION (DESKTOP) ===================== */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-3.5 -bottom-[19px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ===================== KHỐI PHẢI: ACTIONS ===================== */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
            >
              <Search className="size-5" />
            </Button>
          </div>

          {/* Nút chuyển đổi màu (Theme Toggle: Sun / Moon vector icon) */}
          <ThemeToggle />

          {/* Logo giỏ hàng */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
            title="Giỏ hàng của bạn"
          >
            <Link href="/cart" aria-label="Giỏ hàng">
              <ShoppingBag className="size-5" />
              {isMounted && totalItems > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Biểu tượng User */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Tài khoản / Đăng nhập"
          >
            <Link href="/account" aria-label="Tài khoản cá nhân">
              <User className="size-5" />
            </Link>
          </Button>

          {/* Hamburger menu (Mobile) */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mở menu điều hướng"
                >
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs p-6">
                <SheetHeader className="p-0 text-left">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="relative flex h-10 w-40 items-center justify-start">
                      <Image
                        src="/images/logo.svg"
                        alt="Sushi Platform"
                        width={160}
                        height={40}
                        unoptimized
                        className="h-full w-auto max-h-10 object-contain object-left"
                      />
                    </div>
                    <SheetTitle className="sr-only">
                      Menu Điều Hướng
                    </SheetTitle>
                  </div>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3">
                    Điều hướng
                  </span>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-border pt-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
                    <span className="text-sm font-medium">Giao diện</span>
                    <ThemeToggle />
                  </div>
                  <Button asChild className="w-full justify-start gap-2">
                    <Link
                      href="/menu"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UtensilsCrossed className="size-4" />
                      Xem thực đơn ngay
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-start gap-2"
                  >
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="size-4" />
                      Tài khoản của tôi
                    </Link>
                  </Button>
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
