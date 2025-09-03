import { BookDetail } from "@/features/book/components/book-detail/book-detail";
import { RelatedPosts } from "@/features/book/components/related-posts";

export const BookDetailView = ({ isbn }: { isbn: string }) => {
  return (
    <div className="flex flex-col w-full py-8">
      <BookDetail />
      <RelatedPosts isbn={isbn} />
    </div>
  );
};
