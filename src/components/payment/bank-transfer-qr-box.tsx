"use client";

import React, { useState } from "react";
import { QrCode, Copy, Check, Info, Download, ShieldCheck } from "lucide-react";
import { formatPrice, type StorePaymentConfig } from "@/lib/api";
import { PAYMENT_CONFIG } from "@/config/site.config";

export interface BankTransferQrBoxProps {
  orderCode: string;
  totalAmount: number | string;
  paymentQrUrl?: string | null;
  paymentBankInfo?: string | null;
  currentPaymentConfig?: StorePaymentConfig | null;
  isPaid?: boolean;
  className?: string;
}

export function BankTransferQrBox({
  orderCode,
  totalAmount,
  paymentQrUrl,
  paymentBankInfo,
  currentPaymentConfig,
  isPaid = false,
  className = "",
}: BankTransferQrBoxProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. Phân tích thông tin ngân hàng từ snapshot lưu trong đơn hàng, hoặc fallback cấu hình cửa hàng
  let bankName = currentPaymentConfig?.bankName || PAYMENT_CONFIG.vietqr.bankName;
  let accountNumber = currentPaymentConfig?.accountNumber || PAYMENT_CONFIG.vietqr.accountNumber;
  let accountHolder = currentPaymentConfig?.accountHolder || PAYMENT_CONFIG.vietqr.accountHolder;
  let transferSyntax = currentPaymentConfig?.transferSyntax || "HANBI";
  let note = currentPaymentConfig?.note || "Vui lòng ghi đúng mã đơn hàng trong nội dung chuyển khoản để quán xác nhận nhanh nhất.";

  if (paymentBankInfo) {
    try {
      const parsed = JSON.parse(paymentBankInfo);
      if (parsed.bankName) bankName = parsed.bankName;
      if (parsed.accountNumber) accountNumber = parsed.accountNumber;
      if (parsed.accountHolder) accountHolder = parsed.accountHolder;
      if (parsed.transferSyntax) transferSyntax = parsed.transferSyntax;
      if (parsed.note) note = parsed.note;
    } catch {}
  }

  const qrImageUrl = paymentQrUrl || currentPaymentConfig?.qrImageUrl || null;
  const transferMessage = `${transferSyntax} ${orderCode}`;
  const numericAmount = typeof totalAmount === "number" ? totalAmount : Number(totalAmount) || 0;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Nếu đơn đã được xác nhận thanh toán thành công
  if (isPaid) {
    return (
      <div className={`p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 ${className}`}>
        <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
            Đã nhận thanh toán chuyển khoản
          </p>
          <p className="leading-relaxed">
            Nhân viên thu ngân đã kiểm tra và xác nhận thanh toán thành công cho đơn hàng <strong>{orderCode}</strong>. Bếp đang bắt đầu chuẩn bị món ăn tươi ngon cho bạn!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-card border border-primary/30 shadow-md space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <QrCode className="size-4.5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Quét Mã QR Chuyển Khoản
            </h4>
            <p className="text-2xs text-muted-foreground">
              Mở ứng dụng ngân hàng hoặc ví điện tử để quét mã
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-2xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Chờ thanh toán
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Khối Mã QR do Admin tải lên */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-muted/40 border border-border/60">
          {qrImageUrl ? (
            <div className="space-y-2 text-center w-full">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-xl overflow-hidden bg-white p-2 shadow-sm border border-border/80 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt={`Mã QR chuyển khoản đơn ${orderCode}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <a
                href={qrImageUrl}
                target="_blank"
                rel="noreferrer"
                download={`QR-${orderCode}.png`}
                className="inline-flex items-center gap-1.5 text-2xs text-primary font-medium hover:underline pt-1"
              >
                <Download className="size-3" />
                <span>Xem ảnh QR kích thước lớn</span>
              </a>
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <QrCode className="size-16 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">
                Quét mã QR ngân hàng
              </p>
              <p className="text-2xs text-muted-foreground">
                (Sử dụng số tài khoản bên cạnh nếu chưa thấy ảnh QR)
              </p>
            </div>
          )}
        </div>

        {/* Khối Thông tin chuyển khoản chi tiết */}
        <div className="md:col-span-7 space-y-2.5">
          {/* Số tiền cần chuyển */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
            <div>
              <span className="text-2xs text-muted-foreground block">
                Số tiền cần chuyển chính xác:
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-primary">
                {formatPrice(numericAmount)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(String(numericAmount), "amount")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-muted border border-border/80 text-foreground flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Sao chép số tiền"
            >
              {copiedKey === "amount" ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Nội dung chuyển khoản */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-2xs text-amber-600 dark:text-amber-400 font-semibold block">
                Nội dung chuyển khoản (bắt buộc):
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-foreground truncate block">
                {transferMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(transferMessage, "msg")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-muted border border-border/80 text-foreground flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Sao chép nội dung"
            >
              {copiedKey === "msg" ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Chi tiết tài khoản ngân hàng */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngân hàng:</span>
              <span className="font-semibold text-foreground text-right">{bankName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chủ tài khoản:</span>
              <span className="font-semibold text-foreground text-right uppercase">{accountHolder}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground text-sm">{accountNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNumber, "stk")}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  {copiedKey === "stk" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer lưu ý */}
      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-2 text-2xs text-muted-foreground">
        <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {note} Sau khi nhận được chuyển khoản, nhân viên thu ngân sẽ đối chiếu và duyệt đơn để bếp chế biến ngay.
        </p>
      </div>
    </div>
  );
}
