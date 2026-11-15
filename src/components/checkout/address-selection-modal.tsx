"use client";

import * as React from "react";
import { Search, X, MapPin, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WardLocationItem } from "@/lib/api";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: WardLocationItem[];
  selectedWard: string;
  onSelectWard: (ward: string, district: string) => void;
}

const QUICK_SEARCH_TAGS = ["Bến Nghé", "Đa Kao", "Võ Thị Sáu", "Thảo Điền", "An Khánh", "Tân Định"];

export function AddressSelectionModal({
  isOpen,
  onClose,
  locations,
  selectedWard,
  onSelectWard,
}: AddressSelectionModalProps) {
  const [searchWardQuery, setSearchWardQuery] = React.useState("");
  const [wardFilterTab, setWardFilterTab] = React.useState<"all" | "supported">("all");

  const supportedWardsCount = React.useMemo(() => {
    return locations.filter((l) => l.isSupported).length;
  }, [locations]);

  const filteredWards = React.useMemo(() => {
    let list = locations;
    if (wardFilterTab === "supported") {
      list = list.filter((l) => l.isSupported);
    }

    const q = searchWardQuery.trim().toLowerCase();
    if (!q) {
      return list.slice().sort((a, b) => {
        if (a.isSupported !== b.isSupported) {
          return a.isSupported ? -1 : 1;
        }
        return a.ward.localeCompare(b.ward, "vi");
      });
    }

    return list
      .filter((loc) => {
        const matchName = loc.ward.toLowerCase().includes(q);
        const matchFormer = loc.formerWards
          ? loc.formerWards.toLowerCase().includes(q)
          : false;
        const matchDistrict = loc.district
          ? loc.district.toLowerCase().includes(q)
          : false;
        return matchName || matchFormer || matchDistrict;
      })
      .sort((a, b) => {
        if (a.isSupported !== b.isSupported) {
          return a.isSupported ? -1 : 1;
        }
        return a.ward.localeCompare(b.ward, "vi");
      });
  }, [locations, searchWardQuery, wardFilterTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border/80 shadow-2xl rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] sm:max-h-[82vh] overflow-hidden animate-in slide-in-from-bottom duration-250"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-address-title"
      >
        {/* Thanh kéo vuốt trên mobile */}
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto my-2.5 shrink-0 sm:hidden" />

        {/* Header Modal */}
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
            <div>
              <h3 id="modal-address-title" className="font-bold text-sm sm:text-base text-foreground">
                Chọn Phường / Xã TP.HCM
              </h3>
              <p className="text-3xs text-muted-foreground">
                Chuẩn 168 đơn vị hành chính & tra cứu tên cũ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Đóng"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Ô tìm kiếm thông minh & Tabs lọc */}
        <div className="p-3 sm:p-3.5 border-b border-border/60 shrink-0 bg-card space-y-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              autoFocus
              placeholder="Tìm tên mới hoặc tên cũ (Bến Nghé, Đa Kao, Võ Thị Sáu...)"
              value={searchWardQuery}
              onChange={(e) => setSearchWardQuery(e.target.value)}
              className="pl-9.5 pr-8 h-10.5 rounded-xl text-sm bg-muted/30 focus-visible:bg-background"
            />
            {searchWardQuery && (
              <button
                type="button"
                onClick={() => setSearchWardQuery("")}
                className="size-6 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Tabs lọc: Tất cả vs Có giao hàng */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setWardFilterTab("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                wardFilterTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Tất cả ({locations.length})
            </button>
            <button
              type="button"
              onClick={() => setWardFilterTab("supported")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                wardFilterTab === "supported"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Có giao hàng ({supportedWardsCount})</span>
            </button>
          </div>

          {/* Gợi ý tìm nhanh 1-chạm */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-2xs text-muted-foreground">
            <span className="shrink-0 text-muted-foreground/70">Gợi ý:</span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchWardQuery(tag)}
                className="px-2 py-0.5 rounded-md bg-muted/40 hover:bg-muted text-foreground/80 hover:text-primary shrink-0 transition-colors border border-border/40"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách Phường / Xã */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-1.5">
          {filteredWards.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <MapPin className="size-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium">Không tìm thấy phường/xã nào phù hợp</p>
              <p className="text-xs">Hãy thử tìm theo tên phường mới hoặc tên phường/quận cũ</p>
              {wardFilterTab === "supported" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWardFilterTab("all")}
                  className="mt-2 text-xs"
                >
                  Xem tất cả 168 phường/xã
                </Button>
              )}
            </div>
          ) : (
            filteredWards.map((w) => {
              const isSelected = selectedWard === w.ward;
              return (
                <button
                  key={w.wardCode || w.ward}
                  type="button"
                  onClick={() => {
                    onSelectWard(w.ward, w.district);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-3 rounded-xl flex items-start justify-between gap-3 transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/40 active:bg-muted/60"
                  )}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-semibold truncate",
                          isSelected ? "text-primary font-bold" : "text-foreground"
                        )}
                      >
                        {w.ward}
                      </span>
                      {w.isSupported ? (
                        <span className="text-3xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          Có giao hàng
                        </span>
                      ) : (
                        <span className="text-3xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground shrink-0">
                          Chưa hỗ trợ
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {w.district}
                      {w.formerWards && (
                        <span className="text-muted-foreground/80"> • Trước đây: {w.formerWards}</span>
                      )}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 border-t border-border/60 shrink-0 bg-muted/20 flex items-center justify-between text-2xs text-muted-foreground px-4">
          <span>Đang hiển thị {filteredWards.length} kết quả</span>
          <span>Bấm vào để chọn</span>
        </div>
      </div>
    </div>
  );
}
