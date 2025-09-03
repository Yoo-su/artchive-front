import {
  GetBookListParams,
  UseInfiniteRelatedPostsQueryProps,
} from "@/features/book/types";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const bookKeys = createQueryKeys("book", {
  list: (params: GetBookListParams) => [params],
  detail: (isbn: string) => [isbn],
  search: (query: string) => [query],
  myPosts: null,
  relatedPosts: ({
    isbn,
    city,
    district,
    limit,
  }: UseInfiniteRelatedPostsQueryProps) => [isbn, city, district, limit],
  postDetail: (postId: string) => [postId],
});
