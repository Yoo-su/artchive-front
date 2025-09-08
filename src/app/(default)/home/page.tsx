import { Metadata } from "next";

import { DefaultLayout } from "@/layouts/default-layout";
import { MainView } from "@/views/main-view";

export const metadata: Metadata = {
  title: "홈",
  description:
    "ArtChive의 메인 페이지입니다. 지금 가장 인기있는 공연 정보와 새로 등록된 중고 서적을 확인해보세요.",
};

export default function MainPage() {
  return (
    <DefaultLayout>
      <MainView />
    </DefaultLayout>
  );
}
