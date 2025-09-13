"use client";

import { useState } from "react";

import { TextAnimate } from "@/shared/components/magicui/text-animate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { KOREA_DISTRICTS } from "@/shared/constants/korea-districts";

import { useInfiniteRelatedPostsQuery } from "../../queries";
import { RelatedPostsSlider } from "./related-posts-slider";

interface RelatedPostsProps {
  isbn: string;
}

export const RelatedPosts = ({ isbn }: RelatedPostsProps) => {
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteRelatedPostsQuery({ isbn, city, district });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  const handleCityChange = (value: string) => {
    const newCity = value === "all" ? "" : value;
    setCity(newCity);
    setDistrict(""); // 시/도가 바뀌면 시/군/구는 초기화
  };

  const handleDistrictChange = (value: string) => {
    const newDistrict = value === "all" ? "" : value;
    setDistrict(newDistrict);
  };

  return (
    <section className="w-full py-12">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <TextAnimate animation="blurIn" as="h2" className="text-2xl font-bold">
          이 책, 누군가 팔고 있어요!
        </TextAnimate>
        <div className="flex w-full gap-2 sm:w-auto">
          <Select value={city || "all"} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="시/도 전체" />
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
            value={district || "all"}
            onValueChange={handleDistrictChange}
            disabled={!city}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="시/군/구 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">시/군/구 전체</SelectItem>
              {city &&
                KOREA_DISTRICTS[city]?.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-[250px] rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 text-center text-red-500">
          판매글을 불러오는 데 실패했습니다.
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          아직 등록된 판매글이 없어요.
        </div>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <RelatedPostsSlider
          posts={posts}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </section>
  );
};
