"use client";

import { RefreshCw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SaleStatus, SearchBookSalesParams } from "@/features/book/types";
import { Button } from "@/shared/components/shadcn/button";
import { Checkbox } from "@/shared/components/shadcn/checkbox";
import { Input } from "@/shared/components/shadcn/input";
import { Label } from "@/shared/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { Slider } from "@/shared/components/shadcn/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { KOREA_DISTRICTS } from "@/shared/constants/korea-districts";
import { formatPrice } from "@/shared/utils/format-price";

const statusToKorean: { [key in SaleStatus]: string } = {
  FOR_SALE: "판매중",
  RESERVED: "예약중",
  SOLD: "판매완료",
};

const MAX_PRICE = 100000;

export const BookSaleFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
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

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("all");
  const [district, setDistrict] = useState("all");
  const [statuses, setStatuses] = useState<SaleStatus[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    MAX_PRICE,
  ]);
  const [sort, setSort] = useState("createdAt_DESC");

  // Sync URL params to local state
  useEffect(() => {
    setSearchTerm(filterParams.search || "");
    setCity(filterParams.city || "all");
    setDistrict(filterParams.district || "all");
    setStatuses(filterParams.status || []);
    setPriceRange([
      filterParams.minPrice ?? 0,
      filterParams.maxPrice ?? MAX_PRICE,
    ]);
    setSort(
      `${filterParams.sortBy || "createdAt"}_${
        filterParams.sortOrder || "DESC"
      }`
    );
  }, [filterParams]);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setDistrict("all"); // Reset district when city changes
  };

  const handleStatusChange = (status: SaleStatus) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (city !== "all") params.set("city", city);
    if (district !== "all") params.set("district", district);
    statuses.forEach((s) => params.append("status", s));
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < MAX_PRICE)
      params.set("maxPrice", String(priceRange[1]));
    const [sortBy, sortOrder] = sort.split("_");
    if (sortBy !== "createdAt" || sortOrder !== "DESC") {
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCity("all");
    setDistrict("all");
    setStatuses([]);
    setPriceRange([0, MAX_PRICE]);
    setSort("createdAt_DESC");
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      {/* Row 1: Search & Location */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색..."
            className="w-full pl-10 text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={city} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="시/도" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">시/도 전체</SelectItem>
              {Object.keys(KOREA_DISTRICTS).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={district}
            onValueChange={setDistrict}
            disabled={
              !city || city === "all" || KOREA_DISTRICTS[city]?.length === 0
            }
          >
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="시/군/구" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">시/군/구 전체</SelectItem>
              {city &&
                city !== "all" &&
                KOREA_DISTRICTS[city].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Status & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <Label className="shrink-0 font-semibold">상태:</Label>
          {(Object.keys(SaleStatus) as Array<keyof typeof SaleStatus>).map(
            (key) => (
              <div key={key} className="flex items-center gap-1.5">
                <Checkbox
                  id={SaleStatus[key]}
                  checked={statuses.includes(SaleStatus[key])}
                  onCheckedChange={() => handleStatusChange(SaleStatus[key])}
                />
                <Label htmlFor={SaleStatus[key]} className="font-normal">
                  {statusToKorean[SaleStatus[key]]}
                </Label>
              </div>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_DESC">최신순</SelectItem>
              <SelectItem value="price_ASC">낮은 가격순</SelectItem>
              <SelectItem value="price_DESC">높은 가격순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Price Slider & Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-grow items-center gap-4">
          <Label className="shrink-0 font-semibold">가격대:</Label>
          <div className="flex-grow flex items-center gap-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={MAX_PRICE}
              step={1000}
              className="w-full max-w-xs"
            />
            <div className="text-sm text-muted-foreground w-40 text-center">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetFilters}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Reset Filters</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>초기화</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button size="sm" onClick={handleApplyFilters}>
            <Search className="mr-1 h-4 w-4" />
            검색
          </Button>
        </div>
      </div>
    </div>
  );
};
