import { DefaultLayout } from "@/layouts/default-layout";
import BookSearchView from "@/views/book-search-view";

export default function Page() {
  return (
    <DefaultLayout>
      <BookSearchView />
    </DefaultLayout>
  );
}
