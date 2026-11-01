import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BrandStorySection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20 bg-background border-b border-border/60">
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

        {/* Bottom: 3 Value Pillars + 2 Culinary Craft Photos */}
        <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center border-t border-border/60 pt-8">
          {/* 3 Pillars List */}
          <div className="lg:col-span-6 space-y-3">
            <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary tracking-widest">
                  01
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                Sushi truyền thống cùng nguyên vật liệu cao cấp
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Hải sản tươi sống chọn lọc mỗi ngày, hạt gạo Nhật hòa quyện cùng
                giấm ủ cho vị chua thanh tao.
              </p>
            </div>

            <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary tracking-widest">
                  02
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                Thực phẩm an toàn, bảo quản chuẩn nhiệt độ
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Bảo quản lạnh khép kín và đóng hộp chuyên dụng cho món mang đi,
                giữ trọn vẹn dưỡng chất tươi ngon.
              </p>
            </div>

            <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary tracking-widest">
                  03
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                Trải nghiệm văn hoá và tinh thần hiếu khách Nhật Bản
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Mỗi hộp sushi là sự chỉn chu trong từng nhát dao, cách bài trí
                hài hòa theo triết lý ngũ sắc.
              </p>
            </div>
          </div>

          {/* 2 Visual Craft Tiles */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 h-full min-h-[260px]">
            <div className="relative rounded-xl overflow-hidden shadow-sm group">
              <Image
                src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80"
                alt="Chef preparing fresh salmon sashimi with knife"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3.5">
                <p className="text-xs font-medium text-stone-100">
                  Nghệ thuật thái phi-lê chuẩn xác
                </p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-sm group">
              <Image
                src="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80"
                alt="Nigiri sushi craftsmanship with glazed sauce"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3.5">
                <p className="text-xs font-medium text-stone-100">
                  Nigiri lươn nướng sốt Kabayaki
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
