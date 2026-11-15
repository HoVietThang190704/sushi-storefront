import Link from "next/link";
import { ShoppingBag, MapPin, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderStepsSection() {
  const steps = [
    {
      step: "01",
      icon: ShoppingBag,
      title: "Chọn Món Trực Tuyến",
      description:
        "Duyệt danh mục Nigiri, Sashimi, Roll hoặc Combo món yêu thích và thêm nhanh vào giỏ hàng.",
    },
    {
      step: "02",
      icon: MapPin,
      title: "Chọn Khu Vực Giao Hàng",
      description:
        "Nhập địa chỉ nhận hàng tại TP.HCM, hệ thống tự động chọn chi nhánh gần nhất và tính phí ship minh bạch.",
    },
    {
      step: "03",
      icon: Truck,
      title: "Giao Nhanh Chuẩn Lạnh",
      description:
        "Đầu bếp chế biến tươi mới, đóng hộp giữ nhiệt kèm đá gel và giao tận tay bạn nhanh chóng.",
    },
  ];

  return (
    <section className="border-t border-border/60 bg-muted/20 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Quy Trình Đơn Giản
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Đặt Món Giao Tận Nơi Trong 3 Bước
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Tiện lợi, nhanh chóng, giữ trọn độ tươi ngon chuẩn nhà hàng Nhật Bản ngay tại nhà
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-muted-foreground/30">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút hành động dẫn trực tiếp sang trang Thực đơn */}
        <div className="mt-10 sm:mt-12 text-center">
          <Button asChild size="lg" className="rounded-xl px-7 font-semibold shadow-md gap-2">
            <Link href="/menu">
              <span>Khám phá thực đơn & Đặt món ngay</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
