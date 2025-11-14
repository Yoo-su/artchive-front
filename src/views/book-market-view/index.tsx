"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { BookSaleFilter } from "@/features/book/components/book-sale-filter";
import { BookSaleGrid } from "@/features/book/components/book-sale-grid";
import { SaleStatus, SearchBookSalesParams } from "@/features/book/types";

const BookMarketClientView = () => {
  const searchParams = useSearchParams();

  const filterParams: SearchBookSalesParams = useMemo(() => {
    const params: SearchBookSalesParams = {};
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const district = searchParams.get("district");
    const status = searchParams.getAll("status") as SaleStatus[];
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (search) params.search = search;
    if (city) params.city = city;
    if (district) params.district = district;
    if (status.length > 0) params.status = status;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);

    return params;
  }, [searchParams]);

  return (
    <>
      <BookSaleFilter />
      <BookSaleGrid filterParams={filterParams} />
    </>
  );
};

export const BookMarketView = () => {
  return (
    <div className="w-full py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          중고 서적 마켓
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          보물을 찾아보세요! 다양한 중고 서적들이 주인을 기다리고 있습니다.
        </p>
      </header>
      <main>
        <Suspense
          fallback={
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            </div>
          }
        >
          <BookMarketClientView />
        </Suspense>
      </main>
    </div>
  );
};
