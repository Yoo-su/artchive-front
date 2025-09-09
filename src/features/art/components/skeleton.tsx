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

export const ArtDetailSkeleton = () => (
  <div className="w-full animate-pulse">
    {/* Hero Section Skeleton */}
    <div className="relative h-[60vh] min-h-[400px]">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute bottom-0 left-0 p-8 text-white">
        <Skeleton className="h-6 w-32 mb-4 rounded-md" />
        <Skeleton className="h-12 w-3/4 mb-2 rounded-md" />
        <Skeleton className="h-10 w-1/2 rounded-md" />
      </div>
    </div>

    {/* Content Section Skeleton */}
    <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <Skeleton className="h-8 w-1/4 rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
        <Skeleton className="h-8 w-1/4 rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
