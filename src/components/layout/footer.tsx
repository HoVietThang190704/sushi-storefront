import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="relative flex h-10 w-40 items-center justify-start">
              <Image
                src="/images/logo.svg"
                alt="HANBI SUSHI"
                width={160}
                height={40}
                unoptimized
                className="h-full w-auto object-contain object-left"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hệ thống sushi tươi ngon chế biến sẵn sàng mang đi. Đặt trước,
              nhận tại quầy và thưởng thức trọn vẹn hương vị tinh tế chuẩn Nhật.
            </p>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-primary transition-colors"
                >
                  Thực đơn món ăn
                </Link>
              </li>
              <li>
                <Link
                  href="/branches"
                  className="hover:text-primary transition-colors"
                >
                  Hệ thống chi nhánh
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="hover:text-primary transition-colors"
                >
                  Tra cứu đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Giờ phục vụ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Thời Gian Phục Vụ
            </h4>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Thứ Hai - Chủ Nhật</p>
                <p className="mt-0.5">10:00 - 22:00 hàng ngày</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  (Nhận đơn Take Away đến 21:30)
                </p>
              </div>
            </div>
          </div>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Hỗ Trợ Khách Hàng
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">1900 8888</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span>Phục vụ tại các chi nhánh Hà Nội & TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 HANBI SUSHI Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
