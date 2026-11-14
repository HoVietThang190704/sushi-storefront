"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreConfig, type StoreConfig } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site.config";

export const storeConfigKey = ["store-config"] as const;

export function useStoreConfig() {
  const query = useQuery<StoreConfig | null>({
    queryKey: storeConfigKey,
    queryFn: fetchStoreConfig,
    staleTime: 60 * 1000,
  });

  const customerOrderingEnabled = query.data?.customerOrderingEnabled ?? true;
  const contactPhone = query.data?.contactPhone || SITE_CONFIG.hotline;
  const contactPhoneTel = contactPhone.replace(/\s+/g, "");

  return {
    ...query,
    customerOrderingEnabled,
    contactPhone,
    contactPhoneTel,
  };
}
