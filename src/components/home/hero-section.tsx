"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreConfig } from "@/hooks/use-store-config";

interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  leadTitle: string;
  highlightTitle: string;
  description: string;
  kanjiWatermark: string[];
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "authentic-sushi",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1920&q=85",
    alt: "Authentic Japanese Sushi",
    leadTitle: "Hương vị tinh tế của",
    highlightTitle: "Ẩm thực Sushi Nhật Bản",
    description:
      "Thưởng thức nghệ thuật sushi tươi ngon từ nguồn hải sản cao cấp nhập khẩu chính gốc. Trải nghiệm chất lượng và tinh hoa ẩm thực truyền thống xứ sở Phù Tang.",
    kanjiWatermark: ["伝統", "江戸", "寿司"],
  },
  {
    id: "premium-sashimi",
    image:
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1920&q=85",
    alt: "Fresh Premium Sashimi Platter",
    leadTitle: "Tuyệt tác tươi ngon từ",
    highlightTitle: "Sashimi Hải Sản Thượng Hạng",
    description:
      "Cá hồi Na Uy béo ngậy, cá ngừ đại dương và sò điệp Hokkaido được tuyển chọn mới mỗi ngày, cắt lát tinh tế giữ trọn vị ngọt nguyên bản từ đại dương.",
    kanjiWatermark: ["新鮮", "極上", "刺身"],
  },
  {
    id: "artisan-nigiri",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1920&q=85",
    alt: "Handcrafted Nigiri Sushi",
    leadTitle: "Tâm huyết nghệ nhân trong",
    highlightTitle: "Từng Tuyệt Phẩm Nigiri",
    description:
      "Sự kết hợp hài hòa giữa hạt gạo Nhật dẻo thơm trộn giấm ủ truyền thống cùng kỹ nghệ nắm sushi chuẩn mực của các đầu bếp lành nghề.",
    kanjiWatermark: ["職人", "匠技", "握り"],
  },
  {
    id: "signature-combo",
    image:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1920&q=85",
    alt: "Japanese Sushi Combo Box",
    leadTitle: "Trọn vẹn bữa tiệc cùng",
    highlightTitle: "Khay Combo Tươi Lạnh Tận Nơi",
    description:
      "Bài trí cân đối theo triết lý ngũ sắc Nhật Bản, đóng hộp giữ lạnh chuyên dụng giúp mỗi phần ăn giao đến tay bạn luôn tươi ngon như thưởng thức tại quầy.",
    kanjiWatermark: ["彩り", "特選", "盛合"],
  },
];

const SLIDE_INTERVAL_MS = 5000;

function isNextImageDomainWhitelisted(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "res.cloudinary.com" ||
      parsed.hostname === "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

export function HeroSection() {
  const { heroBanners } = useStoreConfig();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Kết hợp cấu hình Banner từ Admin (Cloudinary CDN / Custom URL) với cơ chế Fallback mặc định
  const slides = React.useMemo<HeroSlide[]>(() => {
    if (!isMounted || !Array.isArray(heroBanners) || heroBanners.length === 0) {
      return DEFAULT_HERO_SLIDES;
    }

    const activeAdminSlides = heroBanners
      .filter(
        (item) =>
          item.isActive !== false &&
          item.imageUrl?.trim() &&
          (item.imageUrl.trim().startsWith("/") ||
            item.imageUrl.trim().startsWith("http://") ||
            item.imageUrl.trim().startsWith("https://"))
      )
      .map((item, idx) => {
        const kanjiTokens = (item.kanjiWatermark || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        return {
          id: item.id || `admin-banner-${idx}`,
          image: item.imageUrl.trim(),
          alt:
            item.highlightTitle?.trim() ||
            item.leadTitle?.trim() ||
            `Hanbi Sushi Banner ${idx + 1}`,
          leadTitle: item.leadTitle?.trim() || "",
          highlightTitle: item.highlightTitle?.trim() || "",
          description: item.description?.trim() || "",
          kanjiWatermark: kanjiTokens,
        };
      });

    return activeAdminSlides.length > 0 ? activeAdminSlides : DEFAULT_HERO_SLIDES;
  }, [heroBanners, isMounted]);

  const safeActiveIndex = slides.length > 0 ? activeIndex % slides.length : 0;

  // Hàm cuộn êm ái xuống phần câu chuyện / thực đơn bên dưới khi bấm nút
  const scrollToNextSection = React.useCallback(() => {
    const targetElement = document.getElementById("brand-story");
    if (!targetElement) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    targetElement.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  // Tự động chuyển slide sau mỗi 5 giây (tạm dừng khi tab ẩn hoặc khi chỉ có 1 slide)
  React.useEffect(() => {
    if (slides.length <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [safeActiveIndex, slides.length]);

  // Triển khai nấc cuộn đầu tiên (First-Step Snap Scroll)
  React.useEffect(() => {
    let isSnapping = false;
    let snapTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const lockSnapTemporarily = () => {
      isSnapping = true;
      if (snapTimeoutId) {
        clearTimeout(snapTimeoutId);
      }
      snapTimeoutId = setTimeout(() => {
        isSnapping = false;
        snapTimeoutId = null;
      }, 900);
    };

    const handleWheel = (e: WheelEvent) => {
      // 1. Chỉ áp dụng trên màn hình máy tính (desktop / laptop)
      if (window.innerWidth < 768) return;

      // 2. Không can thiệp nếu người dùng đang giữ phím bổ trợ (Ctrl+Wheel để zoom, Shift+Wheel cuộn ngang)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // 3. Không can thiệp nếu sự kiện đã bị hủy hoặc đang mở Modal/Sheet/Dropdown khóa cuộn
      if (
        e.defaultPrevented ||
        document.body.style.overflow === "hidden" ||
        document.body.hasAttribute("data-scroll-locked")
      ) {
        return;
      }

      // 4. Tôn trọng cấu hình giảm chuyển động (Accessibility)
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const targetElement = document.getElementById("brand-story");
      if (!targetElement) return;

      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 80;
      const scrollY = window.scrollY;
      const targetTop = Math.max(
        0,
        targetElement.getBoundingClientRect().top + scrollY - headerHeight
      );

      // TH1: Khi đang ở đỉnh (trong Hero Banner) và lăn chuột xuống một nhịp
      if (scrollY < 80 && e.deltaY > 15) {
        if (isSnapping) {
          e.preventDefault();
          return;
        }
        lockSnapTemporarily();
        e.preventDefault();

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
        return;
      }

      // TH2: Khi đang ở ngay đầu BrandStorySection và lăn chuột ngược lên trên
      if (Math.abs(scrollY - targetTop) < 50 && e.deltaY < -15) {
        if (isSnapping) {
          e.preventDefault();
          return;
        }
        lockSnapTemporarily();
        e.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      // TH3: Khi đã cuộn sâu hơn vào nội dung bên dưới: Cuộn tự do 100%, không can thiệp
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (snapTimeoutId) {
        clearTimeout(snapTimeoutId);
      }
    };
  }, []);

  return (
    <section className="relative flex flex-col justify-center overflow-hidden border-b border-border/40 bg-[#16181b] text-stone-100 py-16 sm:py-20 md:py-24 min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[680px] md:h-[78vh] md:max-h-[760px]">
      {/* Background images slideshow with GPU-accelerated Cross-fade & Ken Burns slow zoom */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => {
          const isActive = index === safeActiveIndex;
          const isWhitelisted = isNextImageDomainWhitelisted(slide.image);
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 will-change-[opacity] transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-85 z-1" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                decoding="async"
                unoptimized={!isWhitelisted}
                sizes="100vw"
                className={cn(
                  "object-cover object-right md:object-center will-change-transform transform-gpu transition-transform duration-[6000ms] ease-out motion-reduce:transition-none",
                  isActive ? "scale-105" : "scale-100"
                )}
              />
            </div>
          );
        })}

        {/* Soft directional scrim behind text for crystal-clear readability without drowning the image in dark mud */}
        <div className="absolute inset-0 z-2 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 z-2 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-14 lg:px-8">
        {/* Grid stack cố định chiều cao để chuyển chữ Cross-fade mượt 60fps, chống nhảy khung (Zero Layout Shift) */}
        <div className="grid grid-cols-1 grid-rows-1 max-w-2xl">
          {slides.map((slide, index) => {
            const isActive = index === safeActiveIndex;
            const hasText =
              Boolean(slide.leadTitle) ||
              Boolean(slide.highlightTitle) ||
              Boolean(slide.description);

            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={cn(
                  "col-start-1 row-start-1 will-change-[opacity,transform] transform-gpu transition-all duration-700 ease-out motion-reduce:transition-none",
                  isActive
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none select-none"
                )}
              >
                {hasText && (
                  <>
                    {(slide.leadTitle || slide.highlightTitle) && (
                      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.2] drop-shadow-md">
                        {slide.leadTitle && (
                          <>
                            {slide.leadTitle}{" "}
                            {slide.highlightTitle && (
                              <br className="hidden sm:inline" />
                            )}
                          </>
                        )}
                        {slide.highlightTitle && (
                          <span className="bg-gradient-to-r from-red-400 via-amber-200 to-amber-100 bg-clip-text text-transparent">
                            {slide.highlightTitle}
                          </span>
                        )}
                      </h1>
                    )}

                    {slide.description && (
                      <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-stone-200/95 drop-shadow-sm">
                        {slide.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Thanh chỉ báo chuyển slide (Pill Indicators) - hiển thị khi có từ 2 slide trở lên */}
        {slides.length > 1 && (
          <div
            className="mt-8 sm:mt-10 flex items-center gap-2"
            role="tablist"
            aria-label="Chọn slide giới thiệu"
          >
            {slides.map((slide, index) => {
              const isActive = index === safeActiveIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Chuyển đến slide ${index + 1}: ${slide.highlightTitle || slide.alt}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
                    isActive
                      ? "w-8 bg-primary shadow-sm shadow-primary/50"
                      : "w-2.5 bg-stone-400/45 hover:bg-stone-200/80"
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Decorative vertical Japanese calligraphy watermark (Cross-fade đồng bộ) */}
      <div
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:grid grid-cols-1 grid-rows-1 select-none"
        aria-hidden="true"
      >
        {slides.map((slide, index) => {
          const isActive = index === safeActiveIndex;
          return (
            <div
              key={`kanji-${slide.id}`}
              className={cn(
                "col-start-1 row-start-1 flex flex-col items-center text-stone-100 font-serif text-6xl tracking-[0.35em] drop-shadow-lg transition-opacity duration-700 ease-in-out",
                isActive && slide.kanjiWatermark.length > 0
                  ? "opacity-25"
                  : "opacity-0"
              )}
            >
              {slide.kanjiWatermark.map((kanji, kIdx) => (
                <span key={`${slide.id}-k-${kIdx}`}>{kanji}</span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Nút chỉ báo cuộn ở đáy Banner */}
      <button
        type="button"
        onClick={scrollToNextSection}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-stone-300/80 hover:text-white transition-colors cursor-pointer group"
        aria-label="Cuộn xuống xem câu chuyện và thực đơn"
      >
        <span className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase opacity-75 group-hover:opacity-100 transition-opacity">
          Khám phá
        </span>
        <ChevronDown className="size-4.5 animate-bounce text-stone-300" />
      </button>
    </section>
  );
}
