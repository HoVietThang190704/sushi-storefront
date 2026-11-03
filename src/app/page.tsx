import { HeroSection } from "@/components/home/hero-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { CuratedCategoriesSection } from "@/components/home/curated-categories-section";
import { OrderStepsSection } from "@/components/home/order-steps-section";
import { CulinaryNewsSection } from "@/components/home/culinary-news-section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* 1. Hero chính phong cách ẩm thực Nhật Bản với ảnh sushi sắc nét */}
      <HeroSection />

      {/* 2. Điểm nhấn triết lý ẩm thực & nghệ nhân (Chiyoda signature asymmetric card) */}
      <BrandStorySection />

      {/* 3. Danh mục thực đơn đặc sắc (Sashimi, Sushi, Combo, Nướng, Mì, Tráng miệng) */}
      <CuratedCategoriesSection />

      {/* 4. Quy trình nhận món tiện lợi 3 bước */}
      <OrderStepsSection />

      {/* 5. Tin tức ẩm thực & chương trình ưu đãi */}
      <CulinaryNewsSection />
    </div>
  );
}
