// src/features/book/components/book-search/book-search-input.tsx
"use client";

import debounce from "lodash/debounce";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/shared/components/shadcn/input";

import { useBookSearchStore } from "../stores/use-book-search-store";

export const BookSearchInput = () => {
  const query = useBookSearchStore((state) => state.query);
  const setQuery = useBookSearchStore((state) => state.setQuery);
  const [inputValue, setInputValue] = useState(query);

  const debouncedSetQuery = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 500), // 500ms (0.5초)의 지연시간 설정
    [setQuery]
  );
  useEffect(() => {
    debouncedSetQuery(inputValue);

    // 컴포넌트가 언마운트될 때, 예약된 debounce 함수를 취소하여 메모리 누수를 방지합니다.
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [inputValue, debouncedSetQuery]);

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
