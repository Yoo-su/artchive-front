"use client";

import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useRecentBookPostsQuery } from "../../../queries";
import { RecentPostsSliderSkeleton } from "../skeleton";
import { RecentPostCard } from "./recent-post-card";

export const RecentPostsSlider = () => {
  const { data: posts, isLoading, isError } = useRecentBookPostsQuery();

  // ✨ [수정] 헤더 부분을 별도의 컴포넌트로 분리하여 재사용
  const SliderHeader = () => (
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">
          따끈따끈,
        </span>
        지금 막 올라왔어요!
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        가장 새로운 중고 서적들을 만나보세요.
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <section className="w-full py-12 bg-gray-50/50 overflow-hidden">
        <SliderHeader />
        <RecentPostsSliderSkeleton />
      </section>
    );
  }

  if (isError || !posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 bg-gray-50/50 overflow-hidden">
      <SliderHeader />
      <Swiper
        modules={[Autoplay]}
        slidesPerView={"auto"}
        spaceBetween={32}
        loop={posts.length > 5}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="!px-4"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="!w-40">
            <RecentPostCard post={post} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
