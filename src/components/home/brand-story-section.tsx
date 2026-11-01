import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function BrandStorySection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20 bg-background border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Split: Red Statement Card (Chiyoda signature style) + Editorial Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left: Japanese Vermilion Red Accent Card */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 via-red-800 to-red-950 p-8 sm:p-10 text-white shadow-xl shadow-red-950/20 flex flex-col justify-between">
            {/* Traditional Japanese Watermark Motif */}
            <div
              className="pointer-events-none absolute -bottom-6 -right-6 select-none opacity-10 font-serif text-9xl text-white font-bold"
              aria-hidden="true"
            >
              匠
            </div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-red-100 backdrop-blur-xs">
                <Sparkles className="size-3 text-amber-300" />
                <span>TRIẾT LÝ ẨM THỰC • 料理哲学</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug tracking-tight text-white">
                Hương vị chuẩn Nhật từ nguyên liệu tươi ngon chính gốc.
              </h2>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
              <p className="font-serif italic text-lg sm:text-xl text-red-100 leading-relaxed">
                “Trải nghiệm chất lượng Nhật Bản ngay tại Việt Nam cùng Hanbi Sushi.”
              </p>
              <p className="mt-3 text-xs tracking-wider text-red-200/80 uppercase">
                Hanbi Sushi Art & Passion
              </p>
            </div>
          </div>

          {/* Right: Narrative Story Block */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-0.5 w-6 bg-primary" />
                <span>CHUYỆN NGHỀ & TÂM HUYẾT</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
                Gìn giữ nguyên vẹn tinh hoa ẩm thực truyền thống xứ sở Phù Tang
              </h3>
              <p>
                Với sứ mệnh mang văn hoá ẩm thực sushi đích thực đến gần hơn với
                thực khách Việt, Hanbi Sushi chú trọng từ những hạt gạo dẻo thơm
                chuẩn vị giấm Nhật đến từng lát cá hồi, cá ngừ tươi ngon được sơ
                chế chuẩn kỹ thuật Sashimi mỗi sáng.
              </p>
              <p className="text-muted-foreground/90">
                Điều đó không chỉ thể hiện qua hương vị thanh khiết, ngọt tự nhiên
                của đại dương, mà còn qua quy trình đóng gói giữ lạnh tỉ mỉ, giúp
                mỗi phần sushi mang về vẫn trọn vẹn chất lượng như vừa được phục
                vụ tại quầy bar của nghệ nhân.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Khám phá các món ăn đặc trưng của chúng tôi</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Split: 3 Pillars + 2 Visual Culinary Photos */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-border/60 pt-10">
          {/* 3 Pillars List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <span className="text-xs font-mono font-bold text-primary tracking-widest">
                01
              </span>
              <h4 className="mt-1.5 text-base font-semibold text-foreground flex items-center justify-between">
                <span>Sushi truyền thống cùng nguyên vật liệu cao cấp</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Hải sản tươi sống chọn lọc mỗi ngày, hạt gạo Nhật hòa quyện cùng
                giấm ủ truyền thống cho vị chua thanh tao.
              </p>
            </div>

            <div className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <span className="text-xs font-mono font-bold text-primary tracking-widest">
                02
              </span>
              <h4 className="mt-1.5 text-base font-semibold text-foreground flex items-center justify-between">
                <span>Thực phẩm an toàn, bảo quản chuẩn nhiệt độ</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Chuỗi bảo quản lạnh khép kín và đóng hộp chuyên dụng cho món mang
                đi, giữ trọn vẹn dưỡng chất tươi ngon.
              </p>
            </div>

            <div className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <span className="text-xs font-mono font-bold text-primary tracking-widest">
                03
              </span>
              <h4 className="mt-1.5 text-base font-semibold text-foreground flex items-center justify-between">
                <span>Không chỉ là ẩm thực, mà là trải nghiệm văn hoá Nhật</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Mỗi hộp sushi là sự chỉn chu trong từng nhát dao, cách bài trí
                hài hòa theo triết lý ngũ sắc của người Nhật.
              </p>
            </div>
          </div>

          {/* 2 Visual Craft Tiles (Artisan Cutting + Lanterns) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 h-full min-h-[300px]">
            <div className="relative rounded-2xl overflow-hidden shadow-md group">
              <Image
                src="https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80"
                alt="Chef preparing fresh salmon sashimi with knife"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <p className="text-xs font-medium text-stone-100">
                  Nghệ thuật thái phi-lê chuẩn xác
                </p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-md group">
              <Image
                src="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80"
                alt="Nigiri sushi craftsmanship with glazed sauce"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <p className="text-xs font-medium text-stone-100">
                  Nigiri lươn sốt nướng thủ công
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
