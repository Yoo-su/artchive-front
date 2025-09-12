"use client";

import Image from "next/image";
import { useState } from "react";

import { Lens } from "@/shared/components/magicui/lens";

import { UsedBookPost } from "../../types";

interface BookPostInfoProps {
  post: UsedBookPost;
}

export const BookPostInfo = ({ post }: BookPostInfoProps) => {
  const [mainImage, setMainImage] = useState(
    post.imageUrls[0] ?? post.book.image
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Lens className="w-full aspect-square border rounded-lg">
          <Image
            src={mainImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </Lens>

        <div className="flex gap-2">
          {post.imageUrls.map((url) => (
            <button
              key={url}
              className={`relative w-20 h-20 overflow-hidden border-2 rounded-md transition-all ${
                mainImage === url
                  ? "border-violet-500 scale-105"
                  : "border-transparent"
              }`}
              onClick={() => setMainImage(url)}
            >
              <Image src={url} alt="Thumbnail" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
