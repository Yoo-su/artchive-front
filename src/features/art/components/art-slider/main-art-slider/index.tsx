"use client";

import { ReactNode, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useArtListQuery } from "@/features/art/queries";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/shared/utils";

import { ArtDomain, Genre, GetArtListParams } from "../../../types";
import { ArtSliderSkeleton } from "../../skeleton";
import { MainArtCard } from "./main-art-card";

interface ArtSliderRootProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}
export const ArtSliderRoot = ({
  children,
  title,
  subtitle,
}: ArtSliderRootProps) => {
  return (
    <section className="w-full py-16 bg-gray-900 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg text-gray-300">{subtitle}</p>
      </div>
      <div className="flex flex-col w-full gap-4">{children}</div>
    </section>
  );
};

interface ArtSliderWithChips {
  chips: ArtDomain[];
  queryOptions?: Omit<GetArtListParams, "genreCode">;
}
export const ArtSliderWithChips = ({
  chips,
  queryOptions,
}: ArtSliderWithChips) => {
  const [activeGenre, setActiveGenre] = useState<Genre>(chips[0].genreCode);
  const { data: items, isLoading } = useArtListQuery({
    ...queryOptions,
    genreCode: activeGenre,
  });

  return (
    <>
      {/* ✨ [수정] 칩 리스트를 relative 컨테이너로 감싸 그라데이션 효과를 추가합니다. */}
      <div className="relative">
        {/* ✨ [수정] justify-center를 제거하여 왼쪽부터 정렬되도록 하고, 좌우 패딩을 추가합니다. */}
        <div className="flex gap-2 py-2 px-4 sm:px-8 overflow-x-auto scrollbar-hide">
          {chips.map((chip) => (
            <Button
              key={chip.genreCode}
              variant={activeGenre === chip.genreCode ? "default" : "outline"}
              size="sm"
              // ✨ [수정] 버튼이 줄어들지 않도록 flex-shrink-0 추가
              className={cn(
                "rounded-full px-4 py-1 transition-all duration-300 flex-shrink-0",
                activeGenre === chip.genreCode
                  ? "bg-violet-500 text-white shadow-lg scale-105 border-violet-500"
                  : "text-gray-300 bg-white/10 border-white/20 hover:bg-white/20 hover:text-white"
              )}
              onClick={() => setActiveGenre(chip.genreCode)}
            >
              {chip.title}
            </Button>
          ))}
        </div>
        {/* ✨ [추가] 스크롤이 가능하다는 것을 알려주는 우측 그라데이션 효과 (데스크탑에서는 숨김) */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-gray-900 pointer-events-none sm:hidden" />
      </div>

      {isLoading ? (
        <div className="mt-4">
          <ArtSliderSkeleton />
        </div>
      ) : (
        <Swiper
          key={activeGenre}
          className="!px-4 sm:!px-8 py-8 w-full"
          modules={[Autoplay]}
          slidesPerView={"auto"}
          spaceBetween={16}
          centeredSlides={true}
          loop={items && items.length > 3}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {items?.map((item) => (
            <SwiperSlide key={item.mt20id} className="!w-[240px] sm:!w-[280px]">
              <MainArtCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

ArtSliderRoot.SliderWithChips = ArtSliderWithChips;
