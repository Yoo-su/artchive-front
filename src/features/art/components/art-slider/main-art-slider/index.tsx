"use client";

import { useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useArtListQuery } from "@/features/art/queries";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/shared/utils";

import { ArtDomain, Genre, GetArtListParams } from "../../../types";
import { ArtSliderSkeleton } from "../../skeleton";
import { MainArtCard } from "./main-art-card";

interface MainArtSliderProps {
  title: string;
  subtitle: string;
  chips: ArtDomain[];
  queryOptions?: Omit<GetArtListParams, "genreCode">;
}

export const MainArtSlider = ({
  title,
  subtitle,
  chips,
  queryOptions,
}: MainArtSliderProps) => {
  const [activeGenre, setActiveGenre] = useState<Genre>(chips[0].genreCode);
  const { data: items, isLoading } = useArtListQuery({
    ...queryOptions,
    genreCode: activeGenre,
  });

  return (
    <section className="w-full py-16 bg-gray-900 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg text-gray-300">{subtitle}</p>
      </div>

      <div className="relative">
        <div className="flex justify-start sm:justify-center gap-2 py-2 px-4 sm:px-8 overflow-x-auto scrollbar-hide">
          {chips.map((chip) => (
            <Button
              key={chip.genreCode}
              variant={activeGenre === chip.genreCode ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full cursor-pointer px-4 py-1 transition-all duration-300 flex-shrink-0",
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
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-gray-900 pointer-events-none sm:hidden" />
      </div>

      {isLoading ? (
        <div className="mt-4">
          <ArtSliderSkeleton />
        </div>
      ) : (
        <div className="mt-4">
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
              <SwiperSlide
                key={item.mt20id}
                className="!w-[240px] sm:!w-[280px]"
              >
                <MainArtCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
};
