import { ShoppingBag, Store, Clock } from "lucide-react";

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
      icon: Store,
      title: "Chọn Chi Nhánh & Hẹn Giờ",
      description:
        "Khi kiểm tra đơn, chọn chi nhánh thuận tiện nhất và khung giờ bạn muốn ghé lấy món.",
    },
    {
      step: "03",
      icon: Clock,
      title: "Nhận Món & Thanh Toán",
      description:
        "Đầu bếp chuẩn bị sẵn sàng trước giờ hẹn. Bạn ghé quầy nhận món tươi ngon và thanh toán trực tiếp.",
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
            Đặt Món Take Away Trong 3 Bước
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Tiết kiệm thời gian, không cần xếp hàng chờ đợi chế biến tại quầy
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
      </div>
    </section>
  );
}
