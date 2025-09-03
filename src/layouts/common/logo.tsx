"use client";

import { useRouter } from "next/navigation";

export const Logo = () => {
  const router = useRouter();
  const handleClickLogo = () => {
    router.push("/home");
  };

  return (
    <div
      className="w-fit h-[30px] flex items-center justify-center cursor-pointer"
      onClick={handleClickLogo}
    >
      <span className="text-3xl font-extrabold font-sans leading-none tracking-tight">
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Art
        </span>
        <span className="text-gray-800 dark:text-gray-200">Chive</span>
      </span>
    </div>
  );
};
