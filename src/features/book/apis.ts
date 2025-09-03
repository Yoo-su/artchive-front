import { privateAxios, publicAxios } from "@/shared/libs/axios";
import { DEFAULT_DISPLAY, DEFAULT_SORT, DEFAULT_START } from "./constants";
import {
  CreateBookPostParams,
  GetBookDetailErrorResponse,
  GetBookDetailSuccessResponse,
  GetBookListErrorResponse,
  GetBookListParams,
  GetBookListSuccessResponse,
  GetRelatedPostsParams,
  GetRelatedPostsResponse,
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
  const searchParams = new URLSearchParams();

  const displayParam = (params.display ?? DEFAULT_DISPLAY).toString();
  const startParam = (params.start ?? DEFAULT_START).toString();
  const sortParam = params.sort ?? DEFAULT_SORT;

  searchParams.set("query", params.query);
  searchParams.set("display", displayParam);
  searchParams.set("start", startParam);
  searchParams.set("sort", sortParam);

  const url = `/api/book-list?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("데이터를 가져올 수 없습니다");
  }

  return response.json();
};

/**
 * 책 상세정보 조회 API
 * @param isbn 책 고유 식별값인 isbn코드
 * @returns
 */
export const getBookDetail = async (
  isbn: string
): Promise<GetBookDetailSuccessResponse | GetBookDetailErrorResponse> => {
  const searchParams = new URLSearchParams();

  searchParams.set("isbn", isbn);

  const url = `/api/book-detail?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("데이터를 가져올 수 없습니다");
  }

  return response.json();
};

/**
 * 중고책 판매글 등록 API
 * @param payload
 * @returns
 */
export const createBookPost = async (payload: CreateBookPostParams) => {
  try {
    const response = await privateAxios.post("/book/sell", payload);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to create book post:", error);
    return { success: false, error };
  }
};

/**
 * 내가 등록한 중고책 판매글 목록 조회 API
 */
export const getMyBookPosts = async (): Promise<{
  success: boolean;
  data: UsedBookPost[];
}> => {
  try {
    const response = await privateAxios.get("/user/my-posts");
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Failed to fetch my book posts:", error);
    throw error;
  }
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
}): Promise<{ success: boolean; data: UsedBookPost }> => {
  try {
    const response = await privateAxios.patch(`/book/posts/${postId}/status`, {
      status,
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Failed to update book post status:", error);
    throw error;
  }
};

/** 특정 판매글 상세 정보 조회 API */
export const getBookPostDetail = async (postId: string) => {
  try {
    const response = await publicAxios.get<UsedBookPost>(
      `/book/posts/${postId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to fetch book post detail:", error);
    return { success: false, data: null };
  }
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
