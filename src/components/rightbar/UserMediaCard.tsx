import Image from "next/image";
import Link from "next/link";
import { User } from "@prisma/client";
import prisma from "@/lib/client";
const UserMediaCard = async ({ user }: { user: User }) => {
  const usermedia = await prisma.post.findMany({
    where: {
      userId: user.id,
      image: {
        not: null,
      },
    },
    take: 8,
    select: { image: true },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Media</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* BOTTOM */}
      <div className="flex gap-4 justify-between flex-wrap">
        {usermedia.length
          ? usermedia.map((media) => (
              <div className="relative w-1/5 h-24">
                <Image
                  src={media.image!}
                  alt=""
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ))
          : "no media found"}
      </div>
    </div>
  );
};

export default UserMediaCard;
