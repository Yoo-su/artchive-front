// app/your-route/[isbn]/page.tsx

import { DefaultLayout } from "@/layouts/default-layout";
import { BookSellView } from "@/views/book-sale-form-view";

export default async function Page({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {
  const { isbn } = await params;
  return (
    <DefaultLayout>
      <BookSellView isbn={isbn} />
    </DefaultLayout>
  );
}
