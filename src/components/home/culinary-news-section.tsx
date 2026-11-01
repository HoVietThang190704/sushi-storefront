import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  tag: string;
  image: string;
  summary: string;
}

const NEWS_LIST: NewsItem[] = [
  {
    id: "1",
    title: "Bí mật vị Umami: Chìa khoá tạo nên hương vị sushi trọn vẹn",
    date: "16.10.2026",
    tag: "Văn hoá ẩm thực",
    image:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
    summary:
      "Khám phá sự phối hợp tinh tế giữa tảo bẹ Kombu, cá ngừ bào Katsuobushi và nước tương lên men truyền thống.",
  },
  {
    id: "2",
    title: "Sanma & Cá thu dao Nhật Bản: Tinh hoa hải sản mùa thu",
    date: "17.09.2026",
    tag: "Mùa nguyên liệu",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    summary:
      "Mùa cá béo nhất trong năm được tuyển chọn trực tiếp và phục vụ trong các set sashimi đặc biệt của tháng.",
  },
  {
    id: "3",
    title: "Ưu đãi đặt trước Take Away: Tiết kiệm 15% cho đơn hàng online",
    date: "14.08.2026",
    tag: "Khuyến mãi",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=800&q=80",
    summary:
      "Đặt trước tiện lợi trên website, không chờ đợi tại quầy và nhận ngay ưu đãi đặc quyền cho thành viên.",
  },
];

export function CulinaryNewsSection() {
  return (
    <section className="py-14 md:py-20 bg-background border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-0.5 w-6 bg-primary" />
              <span>CÂU CHUYỆN & CẬP NHẬT</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              TIN TỨC & KHUYẾN MÃI
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Chia sẻ câu chuyện văn hóa ẩm thực Nhật Bản và các chương trình ưu đãi mới nhất.
            </p>
          </div>

          <Button variant="outline" asChild size="sm" className="shrink-0 gap-1.5">
            <Link href="/menu">
              <span>Xem tất cả tin</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* 3 Articles Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {NEWS_LIST.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <SafeImage
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  fallbackSrc="/images/placeholder-dish.svg"
                  fallbackText="Hình ảnh bài viết đang cập nhật"
                />
                <span className="absolute top-3 left-3 rounded-md bg-background/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-xs z-10">
                  {post.tag}
                </span>
              </div>

              {/* Text Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>Đọc tiếp</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
