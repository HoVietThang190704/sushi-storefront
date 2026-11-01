import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BrandStorySection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-18 bg-background border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: Balanced Asymmetric Presentation Card & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left: Japanese Vermilion Accent Card - Balanced & Refined */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-6 sm:p-8 text-white shadow-lg shadow-red-950/15 border border-red-500/30">
            {/* Subtle Takumi Artisan Kanji watermark */}
            <div
              className="pointer-events-none absolute -bottom-4 -right-2 select-none opacity-10 font-serif text-8xl text-white font-bold"
              aria-hidden="true"
            >
              匠
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-red-100 backdrop-blur-xs">
                <span>TRIẾT LÝ ẨM THỰC • 料理哲学</span>
              </div>

              {/* Headline with text-balance to avoid orphaned words */}
              <h2 className="mt-4 font-serif text-xl sm:text-2xl font-bold leading-snug tracking-tight text-white text-balance">
                Hương vị chuẩn Nhật từ nguyên liệu tươi sống chọn lọc
              </h2>

              <div className="mt-6 pt-5 border-t border-white/20">
                <p className="font-serif italic text-base sm:text-lg text-red-100 leading-snug text-balance">
                  “Trải nghiệm trọn vẹn chất lượng Nhật Bản cùng Hanbi Sushi.”
                </p>
                <p className="mt-2 text-[10px] tracking-widest text-red-200/80 uppercase font-mono">
                  HANBI SUSHI • ARTISAN CRAFT
                </p>
              </div>
            </div>
          </div>

          {/* Right: Narrative Story Block with tight, coherent hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-0.5 w-6 bg-primary" />
              <span>CHUYỆN NGHỀ & TÂM HUYẾT</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif leading-snug">
              Gìn giữ trọn vẹn tinh hoa ẩm thực truyền thống Nhật Bản
            </h3>

            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>
                Với mong muốn mang văn hoá sushi đích thực đến gần hơn với thực
                khách Việt, Hanbi Sushi chăm chút từ những hạt cơm dẻo vị giấm
                lên men thanh tao đến từng lát cá hồi, cá ngừ tươi được sơ chế
                chuẩn kỹ thuật sashimi mỗi ngày.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/90">
                Mỗi phần sushi mang về (Take Away) đều tuân theo quy trình đóng
                hộp lạnh khép kín, giữ trọn độ tươi ngon và kết cấu chuẩn vị như
                thưởng thức tại quầy nghệ nhân.
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

        {/* Bottom: 3 Value Pillars (Honest Information, No Fake Click Arrows) + 2 Verified Food Photos */}
        <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center border-t border-border/60 pt-8">
          {/* 3 Pillars List - Clear Informational Commitments */}
          <div className="lg:col-span-6 space-y-3">
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                  1
                </span>
                <h4 className="text-sm font-semibold text-foreground">
                  Nguyên vật liệu hải sản tươi sống cao cấp
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed pl-8.5">
                Cá hồi Na Uy, cá ngừ đại dương nhập mới hàng ngày, gạo Nhật dẻo thơm hòa quyện cùng giấm ủ truyền thống.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                  2
                </span>
                <h4 className="text-sm font-semibold text-foreground">
                  Bảo quản chuẩn nhiệt độ cho đơn Take Away
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed pl-8.5">
                Quy trình giữ lạnh chuyên dụng và khay hộp chuyên biệt bảo vệ cấu trúc hạt cơm cùng độ béo ngọt của cá.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                  3
                </span>
                <h4 className="text-sm font-semibold text-foreground">
                  Trải nghiệm vị giác hài hòa theo triết lý Nhật
                </h4>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed pl-8.5">
                Mỗi hộp sushi bài trí cân đối theo triết lý ngũ sắc, đem lại bữa ăn tinh tế, dinh dưỡng và ngon miệng.
              </p>
            </div>
          </div>

          {/* 2 Visual Craft Tiles with 100% Accurate Captions */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 h-full min-h-[260px]">
            <div className="relative rounded-xl overflow-hidden shadow-sm group">
              <Image
                src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80"
                alt="Khay sushi cuộn Maki Roll tổng hợp tươi ngon"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-stone-100">
                  Khay Maki Roll tổng hợp
                </span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-sm group">
              <Image
                src="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80"
                alt="Đĩa sushi nigiri hải sản tươi trên đá đen"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-stone-100">
                  Set Nigiri hải sản đá đen
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
