import { DefaultLayout } from "@/layouts/default-layout";
import { BookPostEditView } from "@/views/book-post-edit-view"; // 새로 만들 View

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DefaultLayout>
      <BookPostEditView postId={id} />
    </DefaultLayout>
  );
}
