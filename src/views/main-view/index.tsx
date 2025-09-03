"use client";

import { ArtSliderRoot } from "@/features/art/components/art-slider";
import { MAIN_ARTS } from "@/features/art/constants";
import { MainBookSlider } from "@/features/book/components/book-slider/main-book-slider";

export const MainView = () => {
  return (
    <div className="flex flex-col gap-8 py-8">
      <MainBookSlider />
      <ArtSliderRoot>
        <ArtSliderRoot.Title title="현재 진행중인 공연/예술 목록이에요" />
        <ArtSliderRoot.SliderWithChips
          chips={MAIN_ARTS}
          queryOptions={{ prfstate: "02" }}
        />
      </ArtSliderRoot>

      <ArtSliderRoot>
        <ArtSliderRoot.Title title="예정된 공연/예술 목록이에요" />
        <ArtSliderRoot.SliderWithChips
          chips={MAIN_ARTS}
          queryOptions={{ prfstate: "01" }}
        />
      </ArtSliderRoot>
    </div>
  );
};

export default MainView;
