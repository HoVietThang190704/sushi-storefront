"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useStoreConfig } from "@/hooks/use-store-config";
import { SafeImage } from "@/components/ui/safe-image";

interface ValuePillar {
  index: number;
  title: string;
  description: string;
  delayClass: string;
}

const VALUE_PILLARS: ValuePillar[] = [
  {
    index: 1,
    title: "Nguyên vật liệu hải sản tươi sống cao cấp",
    description:
      "Cá hồi Na Uy, cá ngừ đại dương nhập mới hàng ngày, gạo Nhật dẻo thơm hòa quyện cùng giấm ủ truyền thống.",
    delayClass: "delay-75",
  },
  {
    index: 2,
    title: "Bảo quản chuẩn nhiệt độ cho đơn Take Away",
    description:
      "Quy trình giữ lạnh chuyên dụng và khay hộp chuyên biệt bảo vệ cấu trúc hạt cơm cùng độ béo ngọt của cá.",
    delayClass: "delay-150",
  },
  {
    index: 3,
    title: "Trải nghiệm vị giác hài hòa theo triết lý Nhật",
    description:
      "Mỗi hộp sushi bài trí cân đối theo triết lý ngũ sắc, đem lại bữa ăn tinh tế, dinh dưỡng và ngon miệng.",
    delayClass: "delay-225",
  },
];

interface CraftTile {
  src: string;
  alt: string;
  caption: string;
  delayClass: string;
}

const CRAFT_TILES: CraftTile[] = [
  {
    src: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
    alt: "Khay sushi cuộn Maki Roll tổng hợp tươi ngon",
    caption: "Khay Maki Roll tổng hợp",
    delayClass: "delay-150",
  },
  {
    src: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80",
    alt: "Đĩa sushi nigiri hải sản tươi trên đá đen",
    caption: "Set Nigiri hải sản đá đen",
    delayClass: "delay-250",
  },
];

const PILLAR_DELAYS = ["delay-75", "delay-150", "delay-225"];
const TILE_DELAYS = ["delay-150", "delay-250"];

export function BrandStorySection() {
  const [topStoryRef, isTopStoryRevealed] = useScrollReveal(0.1);
  const [bottomCraftRef, isBottomCraftRevealed] = useScrollReveal(0.1);
  const { brandStory } = useStoreConfig();

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const activeStory = isMounted && brandStory ? brandStory : null;

  const cardBadge =
    activeStory?.cardBadge?.trim() || "TRIẾT LÝ ẨM THỰC • 料理哲学";
  const cardTitle =
    activeStory?.cardTitle?.trim() ||
    "Hương vị chuẩn Nhật từ nguyên liệu tươi sống chọn lọc";
  const cardQuote =
    activeStory?.cardQuote?.trim() ||
    "“Trải nghiệm trọn vẹn chất lượng Nhật Bản cùng Hanbi Sushi.”";
  const cardSignature =
    activeStory?.cardSignature?.trim() || "HANBI SUSHI • ARTISAN CRAFT";
  const cardKanji = activeStory?.cardKanji?.trim() || "匠";

  const storyLabel =
    activeStory?.storyLabel?.trim() || "CHUYỆN NGHỀ & TÂM HUYẾT";
  const storyHeading =
    activeStory?.storyHeading?.trim() ||
    "Gìn giữ trọn vẹn tinh hoa ẩm thực truyền thống Nhật Bản";
  const storyParagraph1 =
    activeStory?.storyParagraph1?.trim() ||
    "Với mong muốn mang văn hoá sushi đích thực đến gần hơn với thực khách Việt, Hanbi Sushi chăm chút từ những hạt cơm dẻo vị giấm lên men thanh tao đến từng lát cá hồi, cá ngừ tươi được sơ chế chuẩn kỹ thuật sashimi mỗi ngày.";
  const storyParagraph2 =
    activeStory?.storyParagraph2?.trim() ||
    "Mỗi phần sushi mang về (Take Away) đều tuân theo quy trình đóng hộp lạnh khép kín, giữ trọn độ tươi ngon và kết cấu chuẩn vị như thưởng thức tại quầy nghệ nhân.";

  const displayPillars = React.useMemo<ValuePillar[]>(() => {
    if (
      !activeStory ||
      !Array.isArray(activeStory.pillars) ||
      activeStory.pillars.length === 0
    ) {
      return VALUE_PILLARS;
    }
    const valid = activeStory.pillars
      .filter((p) => p.title?.trim() && p.description?.trim())
      .map((p, idx) => ({
        index: idx + 1,
        title: p.title.trim(),
        description: p.description.trim(),
        delayClass: PILLAR_DELAYS[idx % PILLAR_DELAYS.length],
      }));
    return valid.length > 0 ? valid : VALUE_PILLARS;
  }, [activeStory]);

  const displayTiles = React.useMemo<CraftTile[]>(() => {
    if (
      !activeStory ||
      !Array.isArray(activeStory.craftTiles) ||
      activeStory.craftTiles.length === 0
    ) {
      return CRAFT_TILES;
    }
    const valid = activeStory.craftTiles
      .filter(
        (t) =>
          t.imageUrl?.trim() &&
          (t.imageUrl.trim().startsWith("/") ||
            t.imageUrl.trim().startsWith("http://") ||
            t.imageUrl.trim().startsWith("https://"))
      )
      .map((t, idx) => ({
        src: t.imageUrl.trim(),
        alt: t.caption?.trim() || `Món ăn nghệ thuật ${idx + 1}`,
        caption: t.caption?.trim() || `Tuyệt phẩm ẩm thực #${idx + 1}`,
        delayClass: TILE_DELAYS[idx % TILE_DELAYS.length],
      }));
    return valid.length > 0 ? valid : CRAFT_TILES;
  }, [activeStory]);

  return (
    <section
      id="brand-story"
      className="relative overflow-hidden py-14 md:py-22 bg-background border-b border-border/60 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===================== KHỐI TRÊN: TRIẾT LÝ & CÂU CHUYỆN ===================== */}
        <div
          ref={topStoryRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
        >
          {/* Cột trái: Thẻ đỏ điểm nhấn đặc trưng phong cách Chiyoda */}
          <div
            className={cn(
              "lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-6 sm:p-8 text-white shadow-lg shadow-red-950/15 border border-red-500/30",
              "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
              isTopStoryRevealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
          >
            {/* Chữ Kanji 'Takumi' (Nghệ nhân) in chìm trang nhã */}
            <div
              className="pointer-events-none absolute -bottom-4 right-0 select-none opacity-10 font-serif text-8xl text-white font-bold"
              aria-hidden="true"
            >
              {cardKanji}
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-red-100 backdrop-blur-xs">
                <span>{cardBadge}</span>
              </div>

              <h2 className="mt-4 font-serif text-xl sm:text-2xl font-bold leading-snug tracking-tight text-white text-balance">
                {cardTitle}
              </h2>

              <div className="mt-6 pt-5 border-t border-white/20">
                <p className="font-serif italic text-base sm:text-lg text-red-100 leading-snug text-balance">
                  {cardQuote}
                </p>
                <p className="mt-2 text-[10px] tracking-widest text-red-200/80 uppercase font-mono">
                  {cardSignature}
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Đoạn văn kể chuyện & liên kết dẫn tới thực đơn */}
          <div
            className={cn(
              "lg:col-span-7 flex flex-col justify-center space-y-4",
              "transition-all duration-700 delay-150 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
              isTopStoryRevealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-0.5 w-6 bg-primary" />
              <span>{storyLabel}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif leading-snug">
              {storyHeading}
            </h3>

            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>{storyParagraph1}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/90">
                {storyParagraph2}
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Khám phá thực đơn đặc trưng</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ===================== KHỐI DƯỚI: 3 GIÁ TRỊ CỐT LÕI + 2 ẢNH MÓN ĂN ===================== */}
        <div
          ref={bottomCraftRef}
          className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center border-t border-border/60 pt-8"
        >
          {/* Cột trái: Danh sách 3 giá trị cốt lõi */}
          <div className="lg:col-span-6 space-y-3">
            {displayPillars.map((pillar) => (
              <div
                key={pillar.index}
                className={cn(
                  "rounded-xl border border-border/60 bg-card p-4 shadow-2xs",
                  "transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
                  pillar.delayClass,
                  isBottomCraftRevealed
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                    {pillar.index}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">
                    {pillar.title}
                  </h4>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed pl-8.5">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Cột phải: 2 ảnh món ăn nghệ thuật với hiệu ứng hiện dần mượt mà */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 h-full min-h-[260px]">
            {displayTiles.map((tile, tIdx) => (
              <div
                key={`${tile.alt}-${tIdx}`}
                className={cn(
                  "relative rounded-xl overflow-hidden shadow-sm group min-h-[190px]",
                  "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
                  tile.delayClass,
                  isBottomCraftRevealed
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
              >
                <SafeImage
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  fallbackSrc="/images/placeholder-dish.svg"
                  fallbackText={tile.caption}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 z-10 pointer-events-none">
                  <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-stone-100">
                    {tile.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
