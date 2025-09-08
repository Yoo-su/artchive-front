"use client";

import { ArtSliderRoot } from "@/features/art/components/art-slider/main-art-slider";
import { MAIN_ARTS } from "@/features/art/constants";
import { MainBookSlider } from "@/features/book/components/book-slider/main-book-slider";
import { RecentPostsSlider } from "@/features/book/components/book-slider/recent-post-slider";

export const MainView = () => {
  return (
    <div className="flex flex-col gap-8">
      <MainBookSlider />

      <RecentPostsSlider />

      <ArtSliderRoot
        title="Spotlight: 오늘의 무대"
        subtitle="도시의 밤을 밝히는 가장 뜨거운 공연들을 만나보세요."
      >
        <ArtSliderRoot.SliderWithChips
          chips={MAIN_ARTS}
          queryOptions={{ prfstate: "02" }} // "공연중"
        />
      </ArtSliderRoot>

      <ArtSliderRoot
        title="Coming Soon: 설레는 기다림"
        subtitle="곧 막을 올릴 기대작들을 미리 만나보는 시간."
      >
        <ArtSliderRoot.SliderWithChips
          chips={MAIN_ARTS}
          queryOptions={{ prfstate: "01" }} // "공연예정"
        />
      </ArtSliderRoot>
    </div>
  );
};

export default MainView;
