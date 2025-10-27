export type BookSortParam = "sim" | "date";

export interface GetBookListParams {
  query: string;
  display?: number;
  start?: number;
  sort?: BookSortParam;
}

export interface BookInfo {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}

/**
 * Book List 조회 관련 타입
 */
export interface GetBookListResponseData {
  display: number;
  items: BookInfo[];
  lastBuildDate: string;
  start: number;
  total: number;
}
export interface GetBookListSuccessResponse {
  success: true;
  data: GetBookListResponseData;
}

export interface GetBookListErrorResponse {
  success: false;
  message: string;
}

/**
 * Book Detail 조회 관련 타입
 */
export interface GetBookDetailResponseData {
  display: number;
  items: BookInfo[];
  lastBuildDate: string;
  start: number;
  total: number;
}

export interface GetBookDetailSuccessResponse {
  success: true;
  data: GetBookDetailResponseData;
}

export interface GetBookDetailErrorResponse {
  success: false;
  message: string;
}

export interface CreateBookPostParams {
  title: string;
  price: string;
  city: string;
  district: string;
  content: string;
  imageUrls: string[];
  book: {
    isbn: string;
    title: string;
    description: string;
    author: string;
    publisher: string;
    image: string;
    pubdate: string;
  };
}

/**
 * 중고책 판매글의 상태를 나타내는 Enum
 * - NestJS의 PostStatus Enum과 일치해야 합니다.
 */
export enum PostStatus {
  FOR_SALE = "FOR_SALE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
}

/**
 * 게시글 작성자의 공개 프로필 정보
 * - NestJS의 User 엔티티에서 외부에 노출될 필드만 포함합니다.
 */
export interface PostAuthor {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
}

/**
 * 중고책 판매 게시글의 전체 데이터 구조를 나타내는 타입
 */
export interface UsedBookPost {
  id: number;
  title: string;
  price: number;
  city: string;
  district: string;
  content: string;
  imageUrls: string[];
  status: PostStatus;
  createdAt: string; // ISO 8601 형식의 날짜 문자열
  updatedAt: string; // ISO 8601 형식의 날짜 문자열
  user: PostAuthor; // 작성자 정보 (중첩 객체)
  book: BookInfo; // 책 정보 (중첩 객체)
}

// 책 관련 판매게시글 목록 조회 API 요청 파라미터 타입
export interface GetRelatedPostsParams {
  isbn: string;
  page: number;
  limit: number;
  city?: string;
  district?: string;
}

// 책 관련 판매게시글 목록 API 응답 타입 (NestJS 응답과 일치)
export interface GetRelatedPostsResponse {
  posts: UsedBookPost[];
  total: number;
  page: number;
  hasNextPage: boolean;
}

export interface UseInfiniteRelatedPostsQueryProps {
  isbn: string;
  city?: string;
  district?: string;
  limit?: number;
}

// 판매글 수정을 위한 타입. 모든 필드는 선택적(optional)입니다.
export type UpdateBookPostParams = Partial<{
  title: string;
  price: number;
  city: string;
  district: string;
  content: string;
  imageUrls: string[];
}>;

export type CommonBookPostResponse = {
  success: boolean;
  post: UsedBookPost;
};

export type GetMyBookPostsResponse = {
  success: boolean;
  posts: UsedBookPost[];
};
