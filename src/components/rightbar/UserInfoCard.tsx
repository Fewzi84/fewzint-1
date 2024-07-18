import Image from "next/image";
import Link from "next/link";
import UserInfoCardInteraction from "./UserInfoCardInteraction";
import { User } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import UpdateUser from "./UpdateUser";
const UserInfoCard = async ({ user }: { user: User }) => {
  const date = new Date(user.createdAt);
  const formattedDate = date.toLocaleDateString("en-Us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let isFollowing = false;
  let isFollowrequsetSent = false;
  let isBlocked = false;
  const { userId } = auth();
  if (userId) {
    const followingRes = await prisma.follow.findFirst({
      where: {
        followerID: user.id,
        followingId: userId,
      },
    });
    if (followingRes) isFollowing = true;

    const requestRes = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        reciverId: user.id,
      },
    });
    if (requestRes) isFollowrequsetSent = true;
    const blockRes = await prisma.block.findFirst({
      where: {
        blockerId: userId,
        blockedId: user.id,
      },
    });
    if (blockRes) isBlocked = true;
  } else {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Information</span>
        {userId === user.id ? (
          <UpdateUser user={user} />
        ) : (
          <Link href="/" className="text-blue-500 text-xs">
            See all
          </Link>
        )}
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col gap-4 text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-xl text-black">
            {" "}
            {user.name && user.surname
              ? user.name + " " + user.surname
              : user.username}
          </span>
          <span className="text-sm">{user.username}</span>
        </div>
        {user.description && <p>{user.description}</p>}
        {user.city && (
          <div className="flex items-center gap-2">
            <Image src="/map.png" alt="" width={16} height={16} />
            <span>
              Living in <b>{user.city}</b>
            </span>
          </div>
        )}

        {user.school && (
          <div className="flex items-center gap-2">
            <Image src="/school.png" alt="" width={16} height={16} />
            <span>
              Went to <b>{user.school}</b>
            </span>
          </div>
        )}

        {user.work && (
          <div className="flex items-center gap-2">
            <Image src="/work.png" alt="" width={16} height={16} />
            <span>
              Works at <b>{user.work}</b>
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          {user.website && (
            <div className="flex gap-1 items-center">
              <Image src="/link.png" alt="" width={16} height={16} />
              <Link href={"/"} className="text-blue-500 font-medium">
                {user.website}
              </Link>
            </div>
          )}
          {user.createdAt && (
            <div className="flex gap-1 items-center">
              <Image src="/date.png" alt="" width={16} height={16} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        <UserInfoCardInteraction
          userid={user.id}
          isBlocked={isBlocked}
          isFollowing={isFollowing}
          isFollowingRequestSent={isFollowrequsetSent}
        />
      </div>
    </div>
  );
};

export default UserInfoCard;
