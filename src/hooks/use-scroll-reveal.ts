"use client";

import * as React from "react";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Hook quan sát cuộn trang (Scroll Reveal) sử dụng IntersectionObserver.
 * - Tự động bật hiển thị ngay nếu người dùng bật chế độ giảm chuyển động (prefers-reduced-motion).
 * - Ngắt kết nối (disconnect) ngay sau lần kích hoạt đầu tiên (one-shot) để tối ưu hiệu năng.
 * - Tuân thủ nghiêm ngặt quy tắc React 19 và ESLint hook rules.
 */
export function useScrollReveal(threshold = 0.1) {
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement | null>(null);

  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const node = elementRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, prefersReducedMotion]);

  const isRevealed = prefersReducedMotion || hasIntersected;

  return [elementRef, isRevealed] as const;
}
