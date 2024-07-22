"use client";

import Image from "next/image";
import { FollowRequest, User } from "@prisma/client";
import { useState, useOptimistic } from "react";
import { acceptFollowRequest } from "@/lib/actions";
type FollowRequests = FollowRequest & { sender: User };
const FriendRequestList = ({ requests }: { requests: FollowRequests[] }) => {
  const [requestState, setRequestState] = useState(requests);
  const [optimisticRequest, setOptimisticREquest] = useOptimistic(
    requestState,
    (state, value) => state.filter((s) => s.id !== value)
  );
  const acceptRequest = async (id: number, senderId: string) => {
    setOptimisticREquest(id);
    try {
      await acceptFollowRequest(senderId);
      setRequestState((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {}
  };
  return (
    <div className="">
      {requests.length
        ? requests.map((r) => (
            <div className="flex items-center justify-between" key={r.id}>
              <div className="flex items-center gap-4">
                <Image
                  src={r.sender.avator || "/noAvatar.png"}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">
                  {r.sender.name && r.sender.surname
                    ? r.sender.name + " " + r.sender.surname
                    : r.sender.username}
                </span>
              </div>
              <div className="flex gap-3 justify-end">
                <form action={() => acceptRequest(r.id, r.sender.id)}>
                  <button>
                    <Image
                      src="/accept.png"
                      alt=""
                      width={20}
                      height={20}
                      className="cursor-pointer"
                    />
                  </button>
                </form>
                <form>
                  <button>
                    <Image
                      src="/reject.png"
                      alt=""
                      width={20}
                      height={20}
                      className="cursor-pointer"
                    />
                  </button>
                </form>
              </div>
            </div>
          ))
        : ""}
    </div>
  );
};

export default FriendRequestList;
