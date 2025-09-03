import Image from "next/image";
import { ReactNode, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/shared/utils";

import { useArtListQuery } from "../queries";
import { ArtDomain, ArtItem, Genre, GetArtListParams } from "../types";
import { ArtSliderSkeleton } from "./skeleton";

interface ArtSliderRootProps {
  children: ReactNode;
}
export const ArtSliderRoot = ({ children }: ArtSliderRootProps) => {
  return (
    <div className="flex flex-col w-full gap-2 overflow-hidden">{children}</div>
  );
};

interface ArtSliderTitleProps {
  title: string;
}
export const ArtSliderTitle = ({ title }: ArtSliderTitleProps) => {
  return (
    <div className="flex justify-between items-center">
      <h5
        className="font-semibold text-xl"
        style={{ fontFamily: "var(--font-nanum-gothic)" }}
      >
        {title}
      </h5>
    </div>
  );
};

/**
 * @description 장르 선택 칩 목록 컴포넌트입니다.
 * ArtCardSliderRoot 내에서만 사용 가능합니다.
 */
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
      <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide">
        {chips.map((chip) => (
          <Button
            key={chip.genreCode}
            variant={activeGenre === chip.genreCode ? "default" : "secondary"}
            size="sm"
            className={cn(
              "rounded-full px-4 py-1",
              activeGenre === chip.genreCode &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => setActiveGenre(chip.genreCode)}
          >
            {chip.title}
          </Button>
        ))}
      </div>
      <ArtSlider
        keyStr={activeGenre}
        isLoading={isLoading}
        items={items ?? []}
      />
    </>
  );
};

interface ArtSliderProps {
  keyStr: string;
  isLoading: boolean;
  items: ArtItem[];
}
export const ArtSlider = ({ keyStr, isLoading, items }: ArtSliderProps) => {
  if (isLoading) {
    return <ArtSliderSkeleton />;
  }

  return (
    <Swiper
      key={keyStr}
      className="w-full relative pb-4 rounded-md"
      slidesPerView={"auto"}
      spaceBetween={12}
      modules={[Autoplay]}
      autoplay
    >
      {items.map((item) => (
        <SwiperSlide key={item.mt20id} className="!w-[203px]">
          <div className="h-[319px] relative rounded-md overflow-hidden">
            <Image
              fill
              sizes="auto"
              src={item.poster}
              alt="art"
              className="object-cover select-none"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

ArtSliderRoot.Title = ArtSliderTitle;
ArtSliderRoot.SliderWithChips = ArtSliderWithChips;
ArtSliderRoot.Slider = ArtSlider;
