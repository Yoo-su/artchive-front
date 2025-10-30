import { DefaultLayout } from "@/layouts/default-layout";
import { BookSaleHistoryView } from "@/views/book-sale-history-view";

export default function Page() {
  return (
    <DefaultLayout>
      <BookSaleHistoryView />
    </DefaultLayout>
  );
}
