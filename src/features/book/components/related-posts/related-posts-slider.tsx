import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@/shared/components/shadcn/button";

import { UsedBookPost } from "../../types";
import { PostCard } from "./post-card";

interface RelatedPostsSliderProps {
  posts: UsedBookPost[];
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

export const RelatedPostsSlider = ({
  posts,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: RelatedPostsSliderProps) => {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={"auto"}
        navigation={{
          nextEl: ".swiper-button-next-related",
          prevEl: ".swiper-button-prev-related",
        }}
        className="!p-1" // for box-shadow
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="!w-[250px] py-8">
            <PostCard post={post} />
          </SwiperSlide>
        ))}

        {hasNextPage && (
          <SwiperSlide className="!w-[250px]">
            <div className="flex h-full w-full items-center justify-center">
              <Button
                variant="outline"
                className="h-full w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "더 보기"
                )}
              </Button>
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Custom Navigation */}
      <div className="swiper-button-prev-related absolute left-0 top-1/2 z-10 -translate-y-1/2 transform">
        <Button size="icon" variant="outline" className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="swiper-button-next-related absolute right-0 top-1/2 z-10 -translate-y-1/2 transform">
        <Button size="icon" variant="outline" className="rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
