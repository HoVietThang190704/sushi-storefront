import { Suspense } from "react";
import { Metadata } from "next";
import { TrackOrderView } from "@/components/track-order/track-order-view";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Theo Dõi Đơn Hàng | Hanbi Sushi",
  description: "Tra cứu tiến trình thực hiện và trạng thái đơn hàng Take Away tại Hanbi Sushi.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground gap-2">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm">Đang tải thông tin đơn hàng...</span>
        </div>
      }
    >
      <TrackOrderView />
    </Suspense>
  );
}
