import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import {
  getBookDetail,
  getBookList,
  getBookPostDetail,
  getBookSummary,
  getMyBookPosts,
  getRecentBookPosts,
  getRelatedPosts,
} from "./apis";
import { DEFAULT_DISPLAY } from "./constants";
import {
  BookInfo,
  GetBookListParams,
  UseInfiniteRelatedPostsQueryProps,
} from "./types";

export const useBookListQuery = (params: GetBookListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookKeys.list(params).queryKey,
    queryFn: async () => {
      const result = await getBookList(params);

      if (!result.success) return [] as BookInfo[];
      return result.data.items;
    },
  });
};

export const useBookDetailQuery = (isbn: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookKeys.detail(isbn).queryKey,
    queryFn: async () => {
      const response = await getBookDetail(isbn);

      if (!response.success) return null;
      return response.data.items[0];
    },
    staleTime: Infinity,
  });
};

export const useInfiniteBookSearch = (query: string) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.bookKeys.search(query).queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params: GetBookListParams = {
        query,
        display: DEFAULT_DISPLAY,
        start: (pageParam - 1) * DEFAULT_DISPLAY + 1,
      };
      const result = await getBookList(params);
      if (!result.success) {
        throw new Error("Failed to fetch book list");
      }
      return {
        items: result.data.items,
        currentPage: pageParam,
        // API가 전체 페이지 수를 주지 않으므로, 받아온 아이템 수가 요청한 수보다 적으면 마지막 페이지로 간주
        isLastPage: result.data.items.length < DEFAULT_DISPLAY,
      };
    },
    initialPageParam: 1, // 첫 페이지는 1
    getNextPageParam: (lastPage) => {
      // 마지막 페이지라면 더 이상 다음 페이지가 없음을 알립니다 (undefined 반환)
      if (lastPage.isLastPage) return undefined;
      return lastPage.currentPage + 1;
    },
    enabled: !!query, // query가 있을 때만 쿼리를 실행합니다.
  });
};

/**
 * 내 판매글 목록을 조회하는 커스텀 훅
 */
export const useMyBookPostsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bookKeys.myPosts.queryKey,
    queryFn: async () => {
      const result = await getMyBookPosts();
      return result.data;
    },
  });
};

/**
 * ✨ 판매글 ID를 받아 상세 정보를 조회하는 커스텀 쿼리 훅
 * @param postId - 조회할 판매글의 ID (문자열)
 */
export const useBookPostDetailQuery = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookKeys.postDetail(postId).queryKey,
    queryFn: async () => {
      const result = await getBookPostDetail(postId);
      if (!result.success || !result.data) {
        throw new Error("판매글 정보를 불러오는 데 실패했습니다.");
      }
      return result.data;
    },
    // postId가 유효한 문자열일 경우에만 쿼리를 실행합니다.
    enabled: !!postId,
  });
};

export const useInfiniteRelatedPostsQuery = ({
  isbn,
  city,
  district,
  limit = 10,
}: UseInfiniteRelatedPostsQueryProps) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.bookKeys.relatedPosts({ isbn, city, district, limit })
      .queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getRelatedPosts({ isbn, page: pageParam, limit, city, district }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    enabled: !!isbn, // isbn이 있을 때만 쿼리 실행
    staleTime: 0,
  });
};
/**
 *  최근 중고책 판매글 목록을 조회하는 커스텀 훅
 */
export const useRecentBookPostsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bookKeys.recentPosts.queryKey,
    queryFn: getRecentBookPosts,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * LLM을 통해 생성된 책 요약/후기 정보를 조회하는 커스텀 훅
 * @param title - 책 제목
 * @param author - 저자
 * @param enabled - 쿼리 자동 실행 여부 (책 정보가 있을 때만 실행)
 */
export const useBookSummaryQuery = (
  title: string,
  author: string,
  enabled: boolean
) => {
  return useQuery({
    // title과 author를 queryKey에 포함시켜 책마다 캐시되도록 함
    queryKey: ["bookSummary", title, author],
    queryFn: async () => {
      const result = await getBookSummary(title, author);
      if (!result.success || !result.data) {
        throw new Error(result.message || "요약 정보를 가져오지 못했습니다.");
      }
      return result.data.summary;
    },
    enabled: enabled, // book 데이터 로딩이 완료되었을 때만 이 쿼리를 실행
    staleTime: Infinity, // 한 번 가져온 요약 정보는 바뀌지 않으므로 fresh 상태 유지
    retry: false, // 실패 시 자동 재시도 비활성화
  });
};
