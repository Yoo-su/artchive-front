import { QUERY_KEYS } from "@/shared/constants/query-keys";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookInfo,
  GetBookListParams,
  UseInfiniteRelatedPostsQueryProps,
  UsedBookPost,
} from "./types";
import {
  getBookDetail,
  getBookList,
  getBookPostDetail,
  getMyBookPosts,
  getRelatedPosts,
  updateBookPostStatus,
} from "./apis";
import { DEFAULT_DISPLAY } from "./constants";

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
 * 판매글 상태를 업데이트하는 뮤테이션 훅 (낙관적 업데이트 적용)
 */
export const useUpdateBookPostStatusMutation = () => {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEYS.bookKeys.myPosts.queryKey;

  return useMutation({
    mutationFn: updateBookPostStatus,
    onMutate: async ({ postId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData<UsedBookPost[]>(queryKey);

      queryClient.setQueryData<UsedBookPost[]>(queryKey, (old) =>
        old
          ? old.map((post) =>
              post.id === postId ? { ...post, status: status as any } : post
            )
          : []
      );

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
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
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    enabled: !!isbn, // isbn이 있을 때만 쿼리 실행
  });
};
