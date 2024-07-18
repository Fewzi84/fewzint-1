"use client";
import { useState, useOptimistic } from "react";
import { switchFollow, siwtchBlock } from "@/lib/actions";
const UserInfoCardInteraction = ({
  userid,
  isFollowing,
  isFollowingRequestSent,
  isBlocked,
}: {
  userid: string;
  isFollowing: boolean;
  isFollowingRequestSent: boolean;
  isBlocked: boolean;
}) => {
  const [userState, setUserState] = useState({
    isBlocked,
    isFollowing,
    isFollowingRequestSent,
  });
  console.log("clicked");
  const follow = async () => {
    addOptimisticUser("follow");
    try {
      await switchFollow(userid);
      setUserState((prev) => ({
        ...prev,
        isFollowing: prev.isFollowing && false,
        isFollowingRequestSent:
          !prev.isFollowing && !prev.isFollowingRequestSent ? true : false,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const block = async () => {
    addOptimisticUser("block");
    try {
      await siwtchBlock(userid);
      setUserState((prev) => ({
        ...prev,
        isBlocked: !prev.isBlocked,
      }));
    } catch (err) {}
  };
  const [optimisticUser, addOptimisticUser] = useOptimistic(
    userState,
    (state, value: "block" | "follow") =>
      value === "follow"
        ? {
            ...state,
            isFollowing: state.isFollowing && false,
            isFollowingRequestSent:
              !state.isFollowing && !state.isFollowingRequestSent
                ? true
                : false,
          }
        : { ...state, isBlocked: state.isBlocked ? false : true }
  );
  return (
    <>
      <form action={follow}>
        <button className="w-full bg-blue-500 text-white text-sm rounded-md p-2">
          {optimisticUser.isFollowing
            ? "Following"
            : optimisticUser.isFollowingRequestSent
            ? "RequestSent"
            : "Follow"}
        </button>
      </form>

      <form action={block} className="self-end ">
        <button className="text-red-400 text-xs cursor-pointer">
          {optimisticUser.isBlocked ? "Unblock user" : "Block User"}
        </button>
      </form>
    </>
  );
};

export default UserInfoCardInteraction;
