"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

interface CategoryHighlight {
  id: string;
  title: string;
  japanese: string;
  desc: string;
  image: string;
  targetCategory?: string;
}

const CATEGORIES: CategoryHighlight[] = [
  {
    id: "sashimi",
    title: "SASHIMI",
    japanese: "刺身",
    desc: "Cá hồi Na Uy, cá ngừ đại dương và sò điệp tươi ngon chuẩn lát cắt tinh tế.",
    image:
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80",
    targetCategory: "sashimi",
  },
  {
    id: "sushi",
    title: "SUSHI NIGIRI",
    japanese: "握り寿司",
    desc: "Hạt cơm dẻo hòa quyện giấm ủ kết hợp tinh tế cùng hải sản tươi cao cấp.",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80",
    targetCategory: "nigiri",
  },
  {
    id: "combo",
    title: "SET COMBO & ROLL",
    japanese: "盛り合わせ",
    desc: "Hộp sushi cuộn Maki và Nigiri phong phú, lựa chọn trọn vẹn cho bữa ăn tiện lợi.",
    image:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80",
    targetCategory: "roll",
  },
  {
    id: "grilled",
    title: "MÓN NƯỚNG & KHAI VỊ",
    japanese: "焼き物・前菜",
    desc: "Lươn nướng sốt Kabayaki óng ánh, cá hồi áp chảo cùng các món khai vị hấp dẫn.",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    targetCategory: "entrée",
  },
  {
    id: "rice-noodle",
    title: "CƠM & MÌ NHẬT",
    japanese: "丼・麺類",
    desc: "Cơm bát Donburi ấm nóng, mì Udon cùng Ramen nước dùng hầm thanh ngọt tự nhiên.",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dessert",
    title: "ĐỒ UỐNG & TRÁNG MIỆNG",
    japanese: "甘味・お飲み物",
    desc: "Trà xanh gạo rang Genmaicha, kem Matcha Hokkaido cùng bánh Mochi thanh ngọt.",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
  },
];

export function CuratedCategoriesSection() {
  const handleCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetCategory?: string
  ) => {
    e.preventDefault();

    if (targetCategory) {
      window.dispatchEvent(
        new CustomEvent("sushi-select-category", {
          detail: { target: targetCategory },
        })
      );
    }

    const menuEl = document.getElementById("thuc-don");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "thuc-don";
    }
  };

  return (
    <section className="relative overflow-hidden py-14 md:py-20 bg-background text-foreground border-b border-border/70 dark:bg-[#0a0b0d] dark:text-stone-100 dark:border-stone-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-border/60 dark:border-stone-800/70 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary dark:text-red-400">
              <span className="h-0.5 w-6 bg-primary dark:bg-red-500" />
              <span>厳選メニュー • MENU HIGHLIGHTS</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl md:text-4xl">
              THỰC ĐƠN ĐẶC SẮC
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground dark:text-stone-400 max-w-xl">
              Lựa chọn danh mục yêu thích để chuyển nhanh đến thực đơn đặt món trực tuyến mang về.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground dark:text-stone-300 dark:hover:text-white transition-colors group shrink-0"
          >
            <span>Xem thực đơn chi tiết</span>
            <ArrowUpRight className="size-4 text-primary dark:text-red-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* 6 Category Tiles Grid (1 col mobile, 2 cols tablet, 3 cols desktop) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((item) => (
            <a
              key={item.id}
              href="#thuc-don"
              onClick={(e) => handleCategoryClick(e, item.targetCategory)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 dark:border-stone-800/80 dark:bg-stone-900/60 dark:shadow-md dark:hover:translate-y-0 dark:hover:border-red-500/50 dark:hover:bg-stone-900 dark:hover:shadow-xl dark:hover:shadow-red-950/20"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30 dark:bg-stone-950">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                  fallbackSrc="/images/placeholder-dish.svg"
                  fallbackText={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-stone-950 dark:via-stone-950/15" />
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-red-300 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs text-muted-foreground/80 dark:text-stone-400 font-serif">
                      {item.japanese}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-muted-foreground dark:text-stone-300">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-red-400 group-hover:text-primary/80 dark:group-hover:text-red-300 transition-colors pt-3 border-t border-border/60 dark:border-stone-800/60">
                  <span>Xem món trong danh mục</span>
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
