import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts, formatPrice } from "@/lib/api";
import { ProductDetailView } from "@/components/menu/product-detail-view";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Món ăn không tồn tại | Hanbi Sushi",
      description: "Món ăn bạn đang tìm kiếm không tồn tại hoặc đã ngừng phục vụ.",
    };
  }

  const priceFormatted = formatPrice(product.sellingPrice);
  const categoryName = product.category?.name || "Sushi Nhật Bản";

  return {
    title: `${product.name} | Hanbi Sushi`,
    description: `Thưởng thức ${product.name} (${categoryName}) tươi ngon chuẩn vị tại Hanbi Sushi. Đơn giá: ${priceFormatted}. Đặt món mang về (Take Away) tiện lợi và nhanh chóng.`,
    openGraph: {
      title: `${product.name} - ${priceFormatted} | Hanbi Sushi`,
      description: `Khám phá món ${product.name} tươi ngon tại Hanbi Sushi.`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-6 w-60 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          <div className="lg:col-span-6">
            <Skeleton className="aspect-[4/3] sm:aspect-square w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Tải các món ăn liên quan cùng danh mục
  const categoryProducts = await fetchProducts(product.categoryId || undefined);
  const relatedProducts = categoryProducts.filter((p) => p.id !== product.id);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <React.Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent params={params} />
    </React.Suspense>
  );
}
