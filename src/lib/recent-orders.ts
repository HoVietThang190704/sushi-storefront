"use client";

import * as React from "react";

export interface RecentOrderLocal {
  code: string;
  token?: string;
  totalAmount?: number | string;
  createdAt: string;
}

const STORAGE_KEY = "hanbi_recent_orders";
const CUSTOM_EVENT_NAME = "hanbi-recent-orders-updated";

function getRecentOrdersSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribeToRecentOrders(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(CUSTOM_EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CUSTOM_EVENT_NAME, callback);
  };
}

/**
 * Lưu đơn hàng vừa đặt vào localStorage và phát sự kiện đồng bộ tức thì trong cùng tab
 */
export function saveRecentOrder(newOrder: RecentOrderLocal): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentOrderLocal[] = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(existing) ? existing : [];
    const updated = [
      newOrder,
      ...list.filter((o) => o.code !== newOrder.code),
    ].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
  } catch (err) {
    console.warn("Could not save recent order to localStorage", err);
  }
}

/**
 * Xóa một mã đơn hàng không còn tồn tại khỏi lịch sử localStorage
 */
export function removeRecentOrder(code: string): void {
  if (typeof window === "undefined" || !code.trim()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: RecentOrderLocal[] = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const target = code.trim().toUpperCase();
    const updated = list.filter((o) => o.code.toUpperCase() !== target);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
  } catch (err) {
    console.warn("Could not remove recent order from localStorage", err);
  }
}

/**
 * Tìm trackingToken đã lưu trên trình duyệt theo mã đơn hàng
 */
export function getRecentOrderToken(code: string): string | undefined {
  if (typeof window === "undefined" || !code.trim()) return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const list: RecentOrderLocal[] = JSON.parse(raw);
    if (!Array.isArray(list)) return undefined;
    const target = code.trim().toUpperCase();
    const found = list.find((o) => o.code.toUpperCase() === target);
    return found?.token || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hook đọc danh sách đơn hàng gần đây, an toàn Hydration và tự cập nhật cả trong cùng tab lẫn đa tab
 */
export function useRecentOrders(): RecentOrderLocal[] {
  const snapshot = React.useSyncExternalStore(
    subscribeToRecentOrders,
    getRecentOrdersSnapshot,
    () => null
  );

  return React.useMemo(() => {
    if (!snapshot) return [];
    try {
      const parsed: RecentOrderLocal[] = JSON.parse(snapshot);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [snapshot]);
}
