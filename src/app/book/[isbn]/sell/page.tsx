// app/your-route/[isbn]/page.tsx

import { DefaultLayout } from "@/layouts/default-layout";

import { BookSellView } from "@/views/book-sell-view";

export default async function Page({ params }: { params: { isbn: string } }) {
  const { isbn } = await params;
  return (
    <DefaultLayout>
      <BookSellView isbn={isbn} />
    </DefaultLayout>
  );
}
