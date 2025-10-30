import { DefaultLayout } from "@/layouts/default-layout";
import { BookSaleDetailView } from "@/views/book-sale-detail-view";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DefaultLayout>
      <BookSaleDetailView saleId={id} />
    </DefaultLayout>
  );
}
