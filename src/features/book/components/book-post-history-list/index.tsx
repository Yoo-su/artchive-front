import { UsedBookPost } from "../../types";
import { BookPostHistoryItem } from "./item";
import { BookX } from "lucide-react";

interface BookPostHistoryListProps {
  posts: UsedBookPost[];
}

export const BookPostHistoryList = ({ posts }: BookPostHistoryListProps) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 p-8 rounded-lg">
        <BookX className="w-12 h-12 mb-4" />
        <p className="font-semibold">판매 내역이 없습니다.</p>
        <p className="text-sm">새로운 중고책을 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BookPostHistoryItem key={post.id} post={post} />
      ))}
    </div>
  );
};
