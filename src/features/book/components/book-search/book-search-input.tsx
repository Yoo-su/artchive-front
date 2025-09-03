"use client";

import { useEffect, useState } from "react";
import { useBookSearchStore } from "../stores/use-book-search-store";
import { Input } from "@/shared/components/shadcn/input";
import { Search } from "lucide-react";

export const BookSearchInput = () => {
  const [inputValue, setInputValue] = useState("");
  const setQuery = useBookSearchStore((state) => state.setQuery);

  // Debounce 로직: 사용자가 타이핑을 멈추고 500ms가 지나면 검색 실행
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, setQuery]);

  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="어떤 책을 찾고 계신가요?"
        className="w-full pl-10 pr-4 py-3 text-lg border-2 rounded-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      />
    </div>
  );
};
