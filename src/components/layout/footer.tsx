"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStoreConfig } from "@/hooks/use-store-config";
import { getJapanesePatternDataUri } from "@/lib/japanese-patterns";

const DEFAULT_FOOTER_CONFIG = {
  patternPreset: "seigaiha",
  customBgImageUrl: "",
  bgColor: "#0b0e14",
  overlayOpacity: 82,
  patternOpacity: 16,
  brandDescription:
    "Hệ thống sushi tươi ngon chuẩn vị Nhật Bản. Đặt trực tuyến, đóng hộp giữ lạnh chuyên dụng và giao hàng tận nơi nhanh chóng tại TP.HCM.",
  openingDays: "Thứ Hai - Chủ Nhật",
  openingHours: "10:00 - 22:00 hàng ngày",
  closingNote: "(Nhận đơn giao hàng đến 21:30)",
  addressNote: "Giao hàng tận nơi tại các chi nhánh khu vực TP. Hồ Chí Minh",
  copyrightText: "© 2026 HANBI SUSHI Platform. All rights reserved.",
};

export function Footer() {
  const pathname = usePathname();
  const { contactPhone, contactPhoneTel, footerConfig: remoteFooter } =
    useStoreConfig();

  // Tránh hydration mismatch khi server render và client render có route pathname hoặc dữ liệu storeConfig khác nhau
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isMinimalMobile =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname === "/order-success" ||
    pathname === "/menu" ||
    pathname?.startsWith("/menu/") ||
    pathname === "/track-order";

  const activeFooter = React.useMemo(() => {
    if (!isMounted || !remoteFooter) {
      return DEFAULT_FOOTER_CONFIG;
    }
    return {
      patternPreset:
        remoteFooter.patternPreset?.trim() || DEFAULT_FOOTER_CONFIG.patternPreset,
      customBgImageUrl: remoteFooter.customBgImageUrl?.trim() || "",
      bgColor: remoteFooter.bgColor?.trim() || DEFAULT_FOOTER_CONFIG.bgColor,
      overlayOpacity:
        typeof remoteFooter.overlayOpacity === "number"
          ? remoteFooter.overlayOpacity
          : DEFAULT_FOOTER_CONFIG.overlayOpacity,
      patternOpacity:
        typeof remoteFooter.patternOpacity === "number"
          ? remoteFooter.patternOpacity
          : DEFAULT_FOOTER_CONFIG.patternOpacity,
      brandDescription:
        remoteFooter.brandDescription?.trim() ||
        DEFAULT_FOOTER_CONFIG.brandDescription,
      openingDays:
        remoteFooter.openingDays?.trim() || DEFAULT_FOOTER_CONFIG.openingDays,
      openingHours:
        remoteFooter.openingHours?.trim() || DEFAULT_FOOTER_CONFIG.openingHours,
      closingNote:
        remoteFooter.closingNote?.trim() || DEFAULT_FOOTER_CONFIG.closingNote,
      addressNote:
        remoteFooter.addressNote?.trim() || DEFAULT_FOOTER_CONFIG.addressNote,
      copyrightText:
        remoteFooter.copyrightText?.trim() ||
        DEFAULT_FOOTER_CONFIG.copyrightText,
    };
  }, [isMounted, remoteFooter]);

  const patternStyle = React.useMemo(() => {
    if (activeFooter.patternPreset === "none" || activeFooter.patternPreset === "custom") {
      return {};
    }
    const strokeAlpha = (activeFooter.patternOpacity ?? 16) / 100;
    return getJapanesePatternDataUri(activeFooter.patternPreset, strokeAlpha, "#d4a853");
  }, [activeFooter.patternPreset, activeFooter.patternOpacity]);

  const hasCustomImage =
    activeFooter.patternPreset === "custom" &&
    Boolean(activeFooter.customBgImageUrl);

  return (
    <footer
      id="footer-contact"
      suppressHydrationWarning
      style={{
        backgroundColor: activeFooter.bgColor,
        ...(patternStyle.backgroundImage
          ? {
              backgroundImage: patternStyle.backgroundImage,
              backgroundSize: patternStyle.backgroundSize,
            }
          : {}),
      }}
      className={cn(
        "relative overflow-hidden border-t border-amber-500/20 text-foreground scroll-mt-20 transition-colors duration-300",
        isMounted && isMinimalMobile && "hidden sm:block"
      )}
    >
      {/* Nếu chọn ảnh nền CDN tùy chỉnh */}
      {hasCustomImage && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${activeFooter.customBgImageUrl}")`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: activeFooter.bgColor,
              opacity: (activeFooter.overlayOpacity ?? 82) / 100,
            }}
          />
        </>
      )}

      {/* Lớp viền sáng nhẹ phía trên giúp tôn màu nền và họa tiết hoa văn Nhật */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/25"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative flex h-11 w-48 items-center justify-start">
              <Image
                src="/images/logo.svg"
                alt="HANBI SUSHI"
                width={220}
                height={46}
                unoptimized
                className="h-full w-auto object-contain object-left"
              />
            </div>
            <p
              suppressHydrationWarning
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {activeFooter.brandDescription}
            </p>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-primary transition-colors"
                >
                  Thực đơn món ăn
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-primary transition-colors"
                >
                  Giỏ hàng đặt món
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-primary transition-colors"
                >
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Giờ phục vụ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Thời Gian Phục Vụ
            </h4>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p
                  suppressHydrationWarning
                  className="font-medium text-foreground"
                >
                  {activeFooter.openingDays}
                </p>
                <p suppressHydrationWarning className="mt-0.5">
                  {activeFooter.openingHours}
                </p>
                {activeFooter.closingNote && (
                  <p
                    suppressHydrationWarning
                    className="mt-1 text-[11px] text-muted-foreground/80"
                  >
                    {activeFooter.closingNote}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Hỗ Trợ Khách Hàng
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a
                  suppressHydrationWarning
                  href={`tel:${isMounted ? contactPhoneTel : "19006868"}`}
                  className="font-medium text-foreground hover:text-primary transition-colors font-mono"
                >
                  {isMounted ? contactPhone : "1900 6868"}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span suppressHydrationWarning>{activeFooter.addressNote}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-muted-foreground">
          <p suppressHydrationWarning>{activeFooter.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
