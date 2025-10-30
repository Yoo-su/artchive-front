import { createQueryKeys } from "@lukemorales/query-key-factory";

import {
  GetBookListParams,
  UseInfiniteRelatedSalesQueryProps,
} from "@/features/book/types";

export const bookKeys = createQueryKeys("book", {
  list: (params: GetBookListParams) => [params],
  detail: (isbn: string) => [isbn],
  search: (query: string) => [query],
  mySales: null,
  relatedSales: ({
    isbn,
    city,
    district,
    limit,
  }: UseInfiniteRelatedSalesQueryProps) => [isbn, city, district, limit],
  saleDetail: (saleId: string) => [saleId],
  recentSales: null,
});
