"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreConfig, type StoreConfig } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site.config";

export const storeConfigKey = ["store-config"] as const;

export function useStoreConfig() {
  const query = useQuery<StoreConfig>({
    queryKey: storeConfigKey,
    queryFn: fetchStoreConfig,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: "always",
    refetchInterval: 60 * 1000,
  });

  const customerOrderingEnabled = query.data?.customerOrderingEnabled ?? true;
  const contactPhone = query.data?.contactPhone || SITE_CONFIG.hotline;
  const contactPhoneTel = contactPhone.replace(/\s+/g, "");
  const heroBanners = query.data?.heroBanners ?? null;
  const brandStory = query.data?.brandStory ?? null;
  const curatedCategories = query.data?.curatedCategories ?? null;
  const culinaryNews = query.data?.culinaryNews ?? null;
  const footerConfig = query.data?.footerConfig ?? null;

  return {
    ...query,
    customerOrderingEnabled,
    contactPhone,
    contactPhoneTel,
    heroBanners,
    brandStory,
    curatedCategories,
    culinaryNews,
    footerConfig,
  };
}
