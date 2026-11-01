import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Sparkles,
  ArrowDown,
  ShieldCheck,
  Clock,
  Fish,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-[#0c0d0f] text-stone-100">
      {/* Background image overlay with atmospheric lighting */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=2000&q=85"
          alt="Authentic Japanese Sushi Platter"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 md:opacity-40 filter saturate-110"
        />
        {/* Cinematic gradient overlays for readability and Japanese sumi-e feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-[#0c0d0f]/75 to-[#0c0d0f]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d0f] via-[#0c0d0f]/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Top Japanese motif & subtitle */}
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-3.5 py-1.5 text-xs font-medium text-red-300 backdrop-blur-xs">
            <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
            <span className="tracking-widest uppercase text-[11px] font-semibold">
              WE DELIVER A TASTE OF REAL JAPAN • 本物の味
            </span>
          </div>

          {/* Main heading */}
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
            Hương vị tinh tế của <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-amber-100 bg-clip-text text-transparent">
              Ẩm thực Sushi Nhật Bản
            </span>
          </h1>

          {/* Subtext description */}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base md:text-lg">
            Thưởng thức nghệ thuật sushi tươi ngon từ nguồn hải sản cao cấp nhập
            khẩu chính gốc. Đặt món mang đi (Take Away) tiện lợi, đầu bếp chế
            biến tươi mới ngay trước giờ nhận.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Button
              size="lg"
              asChild
              className="gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 h-12 shadow-lg shadow-red-950/40 border border-red-500/30 transition-all hover:scale-[1.02]"
            >
              <a href="#thuc-don">
                <UtensilsCrossed className="size-4" />
                <span>Đặt Món Mang Đi</span>
                <ArrowDown className="size-3.5 opacity-80" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="gap-2 border-stone-700 bg-stone-900/60 text-stone-200 hover:bg-stone-800 hover:text-white px-6 h-12 backdrop-blur-xs transition-colors"
            >
              <Link href="/menu">
                <Sparkles className="size-4 text-amber-400" />
                <span>Xem Thực Đơn Đầy Đủ</span>
              </Link>
            </Button>
          </div>

          {/* 3 Quality Pillars Bar */}
          <div className="mt-12 grid grid-cols-1 gap-3 pt-6 border-t border-stone-800/80 sm:grid-cols-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-stone-800/60 bg-stone-900/40 p-3 backdrop-blur-xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                <Fish className="size-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-stone-200">
                  Hải Sản Tươi Sống
                </p>
                <p className="text-[11px] text-stone-400">
                  Nhập khẩu chọn lọc hàng ngày
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-stone-800/60 bg-stone-900/40 p-3 backdrop-blur-xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="size-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-stone-200">
                  Chế Biến Chuẩn Hẹn
                </p>
                <p className="text-[11px] text-stone-400">
                  Sẵn sàng sau 15–20 phút đặt
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-stone-800/60 bg-stone-900/40 p-3 backdrop-blur-xs">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-stone-200">
                  Chuẩn Vị Nhật Bản
                </p>
                <p className="text-[11px] text-stone-400">
                  Đóng gói giữ trọn độ tươi mát
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative vertical Japanese calligraphy watermark */}
      <div
        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center select-none opacity-15 text-stone-100 font-serif text-6xl tracking-[0.3em]"
        aria-hidden="true"
      >
        <span>伝統</span>
        <span>江戸</span>
        <span>寿司</span>
      </div>
    </section>
  );
}
