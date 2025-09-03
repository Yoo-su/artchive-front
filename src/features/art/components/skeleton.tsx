import { Skeleton } from "@/shared/components/shadcn/skeleton";

export const ArtSliderSkeleton = () => {
  return (
    <div className="w-fit flex flex-row gap-2 overflow-hidden flex-nowrap">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="w-[203px] h-[319px] rounded-md" />
      ))}
    </div>
  );
};
