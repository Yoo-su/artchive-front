import { DefaultLayout } from "@/layouts/default-layout";
import { BookPostDetailView } from "@/views/book-post-detail-view";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <DefaultLayout>
      <BookPostDetailView postId={id} />
    </DefaultLayout>
  );
}
