"use client";

import * as React from "react";
import { Store, X, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice, type WardLocationItem } from "@/lib/api";

interface BranchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWardInfo?: WardLocationItem | null;
  selectedWard: string;
  selectedDistrict?: string;
  selectedBranchId: string;
  defaultBranchId?: string;
  onSelectBranchId: (branchId: string) => void;
}

export function BranchSelectionModal({
  isOpen,
  onClose,
  currentWardInfo,
  selectedWard,
  selectedDistrict,
  selectedBranchId,
  defaultBranchId,
  onSelectBranchId,
}: BranchSelectionModalProps) {
  if (!isOpen || !currentWardInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-card border border-border/80 shadow-2xl rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden animate-in slide-in-from-bottom duration-250"
        role="dialog"
        aria-modal="true"
      >
        {/* Thanh kéo vuốt trên mobile */}
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto my-2.5 shrink-0 sm:hidden" />

        {/* Header Sheet */}
        <div className="p-4 border-b border-border/70 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-primary shrink-0" />
              <h3 className="font-bold text-base text-foreground truncate">
                Chọn Chi Nhánh Giao Hàng
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Giao tới: <strong className="text-foreground">{selectedWard}</strong>, {selectedDistrict || currentWardInfo.district}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full shrink-0"
          >
            <X className="size-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </div>

        {/* Danh sách chi nhánh phục vụ */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-3 space-y-2">
          <p className="text-2xs text-muted-foreground px-1 pb-1">
            Khu vực của bạn được hỗ trợ bởi {currentWardInfo.supportedBranches.length} chi nhánh. Bạn có thể chọn chi nhánh gần nhất để tối ưu thời gian và phí ship:
          </p>
          {currentWardInfo.supportedBranches.map((b) => {
            const isSelected = (selectedBranchId || defaultBranchId) === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onSelectBranchId(b.id);
                  onClose();
                }}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 active:bg-muted/60"
                )}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        isSelected ? "text-primary font-bold" : "text-foreground"
                      )}
                    >
                      {b.name}
                    </span>
                    {b.isDefault && (
                      <Badge variant="secondary" className="text-3xs font-medium px-1.5 py-0 bg-primary/15 text-primary">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="size-3 text-primary shrink-0" />
                    <span>Phí giao hàng:</span>
                    <span className="font-mono font-bold text-foreground">{formatPrice(b.fee)}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">
                    Chọn
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Sheet */}
        <div className="p-3 border-t border-border/60 shrink-0 bg-muted/20 flex items-center justify-between text-2xs text-muted-foreground px-4">
          <span>Chi nhánh mặc định tối ưu theo khoảng cách</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
