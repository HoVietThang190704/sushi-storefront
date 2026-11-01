import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-[#16181b] text-stone-100">
      {/* Background image: Bright, appetizing culinary photography */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=2400&q=90"
          alt="Authentic Japanese Sushi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right md:object-center opacity-85 filter contrast-105 saturate-115"
        />
        {/* Soft directional scrim behind text for crystal-clear readability without drowning the image in dark mud */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          {/* Main heading */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.18] drop-shadow-md">
            Hương vị tinh tế của <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-200 to-amber-100 bg-clip-text text-transparent">
              Ẩm thực Sushi Nhật Bản
            </span>
          </h1>

          {/* Subtext description */}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200/95 sm:text-base md:text-lg drop-shadow-sm">
            Thưởng thức nghệ thuật sushi tươi ngon từ nguồn hải sản cao cấp nhập
            khẩu chính gốc. Trải nghiệm chất lượng và tinh hoa ẩm thực truyền
            thống xứ sở Phù Tang.
          </p>
        </div>
      </div>

      {/* Decorative vertical Japanese calligraphy watermark */}
      <div
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center select-none opacity-25 text-stone-100 font-serif text-6xl tracking-[0.35em] drop-shadow-lg"
        aria-hidden="true"
      >
        <span>伝統</span>
        <span>江戸</span>
        <span>寿司</span>
      </div>
    </section>
  );
}
