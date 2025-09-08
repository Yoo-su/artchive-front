import { Skeleton } from "@/shared/components/shadcn/skeleton";

// Swiper 컴포넌트의 실제 구조와 여백을 정확히 모방하여
// 로딩 전후의 레이아웃 쉬프트(Layout Shift) 현상을 방지합니다.
export const BookSliderSkeleton = () => (
  <div className="relative w-full book-swiper-container overflow-hidden">
    {/* ✨ [수정됨] 
      실제 Swiper 컴포넌트의 `padding: 4rem 0` 스타일(`py-16`)을 동일하게 적용하여
      스켈레톤과 실제 콘텐츠의 수직 위치를 완벽하게 일치시킵니다.
    */}
    <div className="py-24">
      <div className="flex justify-center items-center h-[450px]">
        <div className="flex items-center space-x-[-50px]">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-[360px] w-[240px] md:h-[450px] md:w-[300px] rounded-lg bg-gray-200 ${
                i === 1 ? "z-10 scale-105 -translate-y-[25px]" : "scale-90"
              } ${i === 0 ? "opacity-60" : ""} ${i === 2 ? "opacity-60" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const RecentPostsSliderSkeleton = () => {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 w-40"
          >
            <Skeleton className="w-40 h-40 rounded-full" />
            <Skeleton className="h-5 w-3/4 mt-4" />
            <Skeleton className="h-6 w-1/2 mt-2" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
