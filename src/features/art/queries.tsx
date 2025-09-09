import { useQueries, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getArtDetail, getArtList } from "./apis";
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

/**
 * 공연/예술 상세 정보 조회 쿼리
 * @param artId - 조회할 공연의 ID
 */
export const useArtDetailQuery = (artId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.artKeys.detail(artId).queryKey,
    queryFn: async () => {
      const result = await getArtDetail(artId);
      if (!result.success || !result.data) {
        // API 함수에서 에러를 throw하므로, 여기서는 null을 반환하여
        // React Query의 isError 상태로 관리되도록 합니다.
        return null;
      }
      return result.data;
    },
    enabled: !!artId, // artId가 있을 때만 쿼리 실행
    staleTime: 24 * 60 * 60 * 1000, // 24시간 동안 데이터를 fresh 상태로 유지
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
