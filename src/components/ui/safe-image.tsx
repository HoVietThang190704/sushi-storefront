"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  fallbackText?: string;
  fallbackClassName?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc,
  fallbackText = "Hình ảnh đang cập nhật",
  fallbackClassName,
  className,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = React.useState<boolean>(!src);

  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt || "Ảnh thay thế"}
          className={className}
          onError={() => setHasError(true)}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          "relative flex size-full flex-col items-center justify-center bg-muted/60 dark:bg-stone-900/80 p-4 text-center select-none overflow-hidden",
          fallbackClassName
        )}
        aria-label={alt || "Ảnh không khả dụng"}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-background/90 dark:bg-stone-800/90 border border-border/80 shadow-xs text-muted-foreground/80 transition-transform duration-300 group-hover:scale-105">
          <ImageOff className="size-5 stroke-[1.75]" />
        </div>
        <span className="mt-2 text-[11px] font-medium text-muted-foreground/90 tracking-wide line-clamp-1">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
