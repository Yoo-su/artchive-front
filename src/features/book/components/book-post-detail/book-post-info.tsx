"use client";

import Image from "next/image";
import { useState } from "react";

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
      {/* Image Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full overflow-hidden border rounded-lg aspect-square">
          <Image
            src={mainImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>
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
