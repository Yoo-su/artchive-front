import { Skeleton } from "@/shared/components/shadcn/skeleton";

export const ArtSliderSkeleton = () => {
  return (
    // Swiper의 !px-8 py-8 w-full 스타일과 최대한 유사하게 맞춥니다.
    <div className="px-8 py-8 w-full overflow-hidden">
      {/* Swiper의 slidesPerView: "auto", spaceBetween: 24 설정에 맞춰
        flex와 gap을 사용해 스켈레톤 아이템을 배치합니다.
      */}
      <div className="flex flex-row gap-6 animate-pulse">
        {/* 새로운 ArtCard의 w-[280px] h-[380px] 크기를 그대로 적용합니다.
          배경색은 다크 모드에 어울리도록 조정합니다.
        */}
        {[...Array(5)].map((_, index) => (
          <Skeleton
            key={index}
            className="w-[280px] h-[380px] rounded-xl flex-shrink-0 bg-white/10"
          />
        ))}
      </div>
    </div>
  );
};
