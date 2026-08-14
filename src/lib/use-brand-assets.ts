import { useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { useMemo } from "react";

export interface BrandAsset {
  key: string;
  url: string | null;
  alt?: string;
  updatedAt: number;
}

export interface BrandAssetsMap {
  logo: BrandAsset | null;
  favicon: BrandAsset | null;
  hero: BrandAsset | null;
}

export function useBrandAssets(): BrandAssetsMap {
  const query = useQuery(api.brand.getAllBrandAssets);

  return useMemo(() => {
    const map: Record<string, BrandAsset | null> = {
      logo: null,
      favicon: null,
      hero: null,
    };

    if (query) {
      for (const asset of query) {
        if (asset && asset.key in map) {
          map[asset.key] = asset;
        }
      }
    }

    return map as unknown as BrandAssetsMap;
  }, [query]);
}
