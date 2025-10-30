import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BorderBeam } from "@/shared/components/magicui/border-beam";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { Card, CardContent } from "@/shared/components/shadcn/card";
import { formatPostDate } from "@/shared/utils/date";

import { UsedBookSale } from "../../types";
import { SaleStatusBadge } from "../common/sale-status-badge";

interface SaleCardProps {
  sale: UsedBookSale;
  idx: number;
}
export const SaleCard = ({ sale, idx }: SaleCardProps) => {
  const displayDate =
    sale.updatedAt > sale.createdAt ? sale.updatedAt : sale.createdAt;

  return (
    <Link href={`/book/sale/${sale.id}`} passHref>
      <Card className="relative group h-full w-full overflow-hidden duration-300 select-none">
        <CardContent className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={sale.imageUrls[0] || "/placeholder.jpg"}
              alt={sale.title}
              fill
              sizes="250px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/250x192/e2e8f0/64748b?text=Image";
              }}
            />
            <SaleStatusBadge
              status={sale.status}
              className="absolute right-2 top-2"
            />
          </div>
          <div className="p-4 pb-0">
            <h3 className="truncate font-semibold text-gray-800">
              {sale.title}
            </h3>
            <p className="mt-2 text-xl font-bold text-violet-600">
              {sale.price.toLocaleString()}원
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{formatPostDate(displayDate)}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={sale.user.profileImageUrl || ""} />
                <AvatarFallback>
                  {sale.user.nickname.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {sale.user.nickname}
              </span>
            </div>
          </div>
        </CardContent>
        <BorderBeam duration={8} delay={idx * 10} />
      </Card>
    </Link>
  );
};
