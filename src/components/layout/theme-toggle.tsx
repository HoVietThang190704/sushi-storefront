"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Tránh hydration mismatch bằng useSyncExternalStore
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggleTheme = () => {
    const current = theme === "system" ? resolvedTheme : theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label="Chuyển đổi giao diện sáng tối"
      >
        <Sun className="size-5" />
      </Button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
    >
      {isDark ? (
        <Sun className="size-5 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="size-5 text-slate-700 transition-transform duration-200" />
      )}
    </Button>
  );
}
