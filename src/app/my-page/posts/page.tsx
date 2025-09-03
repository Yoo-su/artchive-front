import { DefaultLayout } from "@/layouts/default-layout";
import { BookPostHistoryView } from "@/views/book-post-history-view";

export default function Page() {
  return (
    <DefaultLayout>
      <BookPostHistoryView />
    </DefaultLayout>
  );
}
