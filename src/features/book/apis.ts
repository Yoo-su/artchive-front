import { internalAxios, privateAxios, publicAxios } from "@/shared/libs/axios";

import { DEFAULT_DISPLAY, DEFAULT_SORT, DEFAULT_START } from "./constants";
import {
  CommonBookSaleResponse,
  CreateBookSaleParams,
  GetBookDetailErrorResponse,
  GetBookDetailSuccessResponse,
  GetBookListErrorResponse,
  GetBookListParams,
  GetBookListSuccessResponse,
  GetMyBookSalesResponse,
  GetRelatedSalesParams,
  GetRelatedSalesResponse,
  UpdateBookSaleParams,
  UsedBookSale,
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
export const createBookSale = async (
  payload: CreateBookSaleParams
): Promise<CommonBookSaleResponse> => {
  const { data } = await privateAxios.post<CommonBookSaleResponse>(
    "/book/sale",
    payload
  );

  return data;
};

/**
 * 내가 등록한 중고책 판매글 목록 조회 API
 */
export const getMyBookSales = async (): Promise<GetMyBookSalesResponse> => {
  const { data } =
    await privateAxios.get<GetMyBookSalesResponse>("/user/my-sales");
  return data;
};

/**
 * 중고책 판매글의 상태를 변경하는 API
 */
export const updateBookSaleStatus = async ({
  saleId,
  status,
}: {
  saleId: number;
  status: string;
}): Promise<CommonBookSaleResponse> => {
  const { data } = await privateAxios.patch<CommonBookSaleResponse>(
    `/book/sales/${saleId}/status`,
    {
      status,
    }
  );
  return data;
};

/** 특정 판매글 상세 정보 조회 API */
export const getBookSaleDetail = async (saleId: string) => {
  const { data } = await publicAxios.get<UsedBookSale>(`/book/sales/${saleId}`);
  return data;
};

/**
 * 특정 책(ISBN)에 대한 관련 판매글 목록을 페이지네이션으로 조회하는 API 함수
 */
export const getRelatedSales = async ({
  isbn,
  page,
  limit,
  city,
  district,
}: GetRelatedSalesParams): Promise<GetRelatedSalesResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (city) params.append("city", city);
  if (district) params.append("district", district);

  const response = await publicAxios.get<GetRelatedSalesResponse>(
    `/book/${isbn}/sales`,
    { params }
  );
  return response.data;
};

/**
 * 중고책 판매글 수정 API
 * @param saleId - 수정할 판매글 ID
 * @param payload - 수정할 데이터
 */
export const updateBookSale = async ({
  saleId,
  payload,
}: {
  saleId: number;
  payload: UpdateBookSaleParams;
}) => {
  const { data } = await privateAxios.patch<CommonBookSaleResponse>(
    `/book/sales/${saleId}`,
    payload
  );
  return data;
};

/**
 * 중고책 판매글 삭제 API
 * @param saleId - 삭제할 판매글 ID
 */
export const deleteBookSale = async (saleId: number) => {
  await privateAxios.delete(`/book/sales/${saleId}`);
};

/**
 * 최근 등록된 중고책 판매글 목록 조회 API
 */
export const getRecentBookSales = async (): Promise<UsedBookSale[]> => {
  const { data } = await publicAxios.get<UsedBookSale[]>("/book/sales/recent");
  return data;
};

export const getBookSummary = async (title: string, author: string) => {
  const { data } = await publicAxios.post("/llm/book-summary", {
    title,
    author,
  });
  return data;
};
