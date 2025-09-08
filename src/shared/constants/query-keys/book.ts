import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  GetBookListParams,
  UseInfiniteRelatedPostsQueryProps,
} from "@/features/book/types";

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
  recentPosts: null,
});
