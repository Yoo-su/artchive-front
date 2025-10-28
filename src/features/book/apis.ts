import { internalAxios, privateAxios, publicAxios } from "@/shared/libs/axios";

import { DEFAULT_DISPLAY, DEFAULT_SORT, DEFAULT_START } from "./constants";
import {
  CommonBookPostResponse,
  CreateBookPostParams,
  GetBookDetailErrorResponse,
  GetBookDetailSuccessResponse,
  GetBookListErrorResponse,
  GetBookListParams,
  GetBookListSuccessResponse,
  GetMyBookPostsResponse,
  GetRelatedPostsParams,
  GetRelatedPostsResponse,
  UpdateBookPostParams,
  UsedBookPost,
} from "./types";

/**
 * 책 검색결과 조회 API
 * @param params
 * @returns
 */
export const getBookList = async (
  params: GetBookListParams
): Promise<GetBookListSuccessResponse | GetBookListErrorResponse> => {
  const displayParam = (params.display ?? DEFAULT_DISPLAY).toString();
  const startParam = (params.start ?? DEFAULT_START).toString();
  const sortParam = params.sort ?? DEFAULT_SORT;

  const url = "/book-list";
  const { data } = await internalAxios.get(url, {
    params: {
      query: params.query,
      display: displayParam,
      start: startParam,
      sort: sortParam,
    },
  });

  return data;
};

/**
 * 책 상세정보 조회 API
 * @param isbn 책 고유 식별값인 isbn코드
 * @returns
 */
export const getBookDetail = async (
  isbn: string
): Promise<GetBookDetailSuccessResponse | GetBookDetailErrorResponse> => {
  const url = "/book-detail";
  const { data } = await internalAxios.get(url, {
    params: {
      isbn,
    },
  });

  return data;
};

/**
 * 중고책 판매글 등록 API
 * @param payload
 * @returns
 */
export const createBookPost = async (
  payload: CreateBookPostParams
): Promise<CommonBookPostResponse> => {
  const { data } = await privateAxios.post<CommonBookPostResponse>(
    "/book/sell",
    payload
  );

  return data;
};

/**
 * 내가 등록한 중고책 판매글 목록 조회 API
 */
export const getMyBookPosts = async (): Promise<GetMyBookPostsResponse> => {
  const { data } =
    await privateAxios.get<GetMyBookPostsResponse>("/user/my-posts");
  return data;
};

/**
 * 중고책 판매글의 상태를 변경하는 API
 */
export const updateBookPostStatus = async ({
  postId,
  status,
}: {
  postId: number;
  status: string;
}): Promise<CommonBookPostResponse> => {
  const { data } = await privateAxios.patch<CommonBookPostResponse>(
    `/book/posts/${postId}/status`,
    {
      status,
    }
  );
  return data;
};

/** 특정 판매글 상세 정보 조회 API */
export const getBookPostDetail = async (postId: string) => {
  const { data } = await publicAxios.get<UsedBookPost>(`/book/posts/${postId}`);
  return data;
};

/**
 * 특정 책(ISBN)에 대한 관련 판매글 목록을 페이지네이션으로 조회하는 API 함수
 */
export const getRelatedPosts = async ({
  isbn,
  page,
  limit,
  city,
  district,
}: GetRelatedPostsParams): Promise<GetRelatedPostsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (city) params.append("city", city);
  if (district) params.append("district", district);

  const response = await publicAxios.get<GetRelatedPostsResponse>(
    `/book/${isbn}/posts`,
    { params }
  );
  return response.data;
};

/**
 * 중고책 판매글 수정 API
 * @param postId - 수정할 판매글 ID
 * @param payload - 수정할 데이터
 */
export const updateBookPost = async ({
  postId,
  payload,
}: {
  postId: number;
  payload: UpdateBookPostParams;
}) => {
  const { data } = await privateAxios.patch<CommonBookPostResponse>(
    `/book/posts/${postId}`,
    payload
  );
  return data;
};

/**
 * 중고책 판매글 삭제 API
 * @param postId - 삭제할 판매글 ID
 */
export const deleteBookPost = async (postId: number) => {
  await privateAxios.delete(`/book/posts/${postId}`);
};

/**
 * 최근 등록된 중고책 판매글 목록 조회 API
 */
export const getRecentBookPosts = async (): Promise<UsedBookPost[]> => {
  const { data } = await publicAxios.get<UsedBookPost[]>("/book/posts/recent");
  return data;
};

export const getBookSummary = async (title: string, author: string) => {
  const { data } = await publicAxios.post("/llm/book-summary", {
    title,
    author,
  });
  return data;
};
