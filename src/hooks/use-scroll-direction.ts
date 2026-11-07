"use client";

import * as React from "react";

interface ScrollDirectionOptions {
  threshold?: number;
  initialVisible?: boolean;
}

/**
 * Hook theo dõi hướng cuộn trang để tự động ẩn/hiện Navbar & Header:
 * - Cuộn xuống (Scroll Down) -> isVisible = false (Ẩn thanh trên và dưới)
 * - Cuộn lên (Scroll Up) hoặc ở đầu trang -> isVisible = true (Hiện lại)
 * - Sử dụng requestAnimationFrame và passive listener để đảm bảo độ mượt 60-120fps trên mobile.
 */
export function useScrollDirection({
  threshold = 10,
  initialVisible = true,
}: ScrollDirectionOptions = {}) {
  const [isVisible, setIsVisible] = React.useState(initialVisible);
  const lastScrollY = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;

      // Luôn hiển thị khi ở sát đầu trang
      if (currentScrollY <= 25) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Chỉ thay đổi trạng thái khi độ cuộn vượt ngưỡng threshold để tránh giật giao diện
      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          // Cuộn xuống -> Ẩn
          setIsVisible(false);
        } else {
          // Cuộn lên -> Hiện
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return isVisible;
}
