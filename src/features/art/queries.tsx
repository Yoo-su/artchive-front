import { useQueries, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getArtList } from "./apis";
import { ArtItem, Genre, GetArtListParams } from "./types";

export const useArtListQuery = (params: GetArtListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.artKeys.list(params).queryKey,
    queryFn: async () => {
      const result = await getArtList(params);

      if (!result.success) return [] as ArtItem[];
      return result.data;
    },
    staleTime: Infinity,
  });
};

export const useMainArtsQueries = (
  mainArts: { genreCode: Genre; title: string }[]
) => {
  return useQueries({
    queries: mainArts.map(({ genreCode }) => ({
      queryKey: QUERY_KEYS.artKeys.list({ genreCode }).queryKey,
      queryFn: async () => {
        const result = await getArtList({ genreCode, rows: "20" });

        if (!result.success) return [] as ArtItem[];

        return result.data;
      },
      staleTime: Infinity,
    })),
  });
};
