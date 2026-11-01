import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CategoryHighlight {
  id: string;
  title: string;
  japanese: string;
  desc: string;
  image: string;
  tag?: string;
}

const CATEGORIES: CategoryHighlight[] = [
  {
    id: "sashimi",
    title: "SASHIMI",
    japanese: "刺身",
    desc: "Cá hồi Na Uy, cá ngừ đại dương, sò đỏ và bạch tuộc tươi ngon chuẩn lát cắt",
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    tag: "Tươi sống",
  },
  {
    id: "sushi",
    title: "SUSHI NIGIRI",
    japanese: "握り寿司",
    desc: "Hạt cơm dẻo giấm Nhật đượm vị kết hợp tinh tế cùng hải sản tươi cao cấp",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80",
    tag: "Đặc trưng",
  },
  {
    id: "combo",
    title: "SET COMBO",
    japanese: "盛り合わせ",
    desc: "Hộp sushi & sashimi phối món phong phú, lựa chọn trọn vẹn cho gia đình & tiệc",
    image:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80",
    tag: "Bán chạy",
  },
  {
    id: "grilled",
    title: "MÓN NƯỚNG & KHÁC",
    japanese: "焼き物・揚げ物",
    desc: "Lươn nướng sốt Kabayaki óng ánh, cá hồi nướng muối, Tempura giòn tan",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rice-noodle",
    title: "CƠM & MÌ NHẬT",
    japanese: "丼・麺類",
    desc: "Cơm bát Donburi thịt bò, lươn nướng cùng mì Udon, mì Ramen nước dùng hầm ngọt",
    image:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dessert",
    title: "ĐỒ UỐNG & TRÁNG MIỆNG",
    japanese: "甘味・お飲み物",
    desc: "Trà xanh gạo rang Genmaicha, kem Matcha Hokkaido & bánh Mochi ngọt ngào",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
  },
];

export function CuratedCategoriesSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#0a0b0d] text-stone-100 border-b border-stone-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-stone-800/70 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-red-400">
              <span className="h-0.5 w-6 bg-red-500" />
              <span>厳選メニュー • MENU HIGHLIGHTS</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              THỰC ĐƠN ĐẶC SẮC
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-400 max-w-xl">
              Lựa chọn danh mục yêu thích và đặt ngay món ăn đóng hộp chất lượng
              cao mang về.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition-colors group shrink-0"
          >
            <span>Xem thực đơn chi tiết</span>
            <ArrowUpRight className="size-4 text-red-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* 6 Category Tiles Grid (2 cols mobile, 3 cols desktop) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((item) => (
            <a
              key={item.id}
              href="#thuc-don"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/60 shadow-md transition-all duration-300 hover:border-red-500/50 hover:bg-stone-900 hover:shadow-xl hover:shadow-red-950/20"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                {/* Badge if available */}
                {item.tag && (
                  <span className="absolute top-3 left-3 rounded-full bg-red-600/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                    {item.tag}
                  </span>
                )}

                {/* Japanese Calligraphy Stamp watermark in card */}
                <span
                  className="absolute bottom-2 right-3 font-serif text-2xl font-bold text-white/30 tracking-widest select-none"
                  aria-hidden="true"
                >
                  {item.japanese}
                </span>
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-red-300 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs text-stone-400 font-serif">
                      {item.japanese}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-400">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-400 group-hover:text-red-300 transition-colors pt-3 border-t border-stone-800/60">
                  <span>Chọn món trong thực đơn</span>
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
