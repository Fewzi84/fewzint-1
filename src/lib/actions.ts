"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export const switchFollow = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) return null;
  try {
    const following = await prisma.follow.findFirst({
      where: {
        followerID: userId,
        followingId: currentUserId,
      },
    });
    if (following) {
      await prisma.follow.delete({
        where: {
          id: following.id,
        },
      });
      return;
    }
    const requestSent = await prisma.followRequest.findFirst({
      where: {
        senderId: currentUserId,
        reciverId: userId,
      },
    });
    if (requestSent) {
      await prisma.followRequest.delete({
        where: {
          id: requestSent.id,
        },
      });
      return;
    } else {
      await prisma.followRequest.create({
        data: {
          senderId: currentUserId,
          reciverId: userId,
        },
      });
    }
    return { message: "request sent" };
  } catch (err) {
    console.log(err);
    throw new Error("somthing went wrong");
  }
};
export const siwtchBlock = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) return null;
  try {
    const blocked = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });
    if (blocked) {
      await prisma.block.delete({
        where: {
          id: blocked.id,
        },
      });
      return;
    } else {
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (err) {}
};
export const acceptFollowRequest = async (senderId: string) => {
  const { userId } = auth();
  if (!userId) return null;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        username: true,
      },
    });
    const followrequest = await prisma.followRequest.findFirst({
      where: {
        senderId: senderId,
        reciverId: userId,
      },
    });
    if (followrequest) {
      await prisma.followRequest.delete({
        where: {
          id: followrequest.id,
        },
      });
      await prisma.follow.create({
        data: {
          followerID: userId,
          followingId: senderId,
        },
      });
    }
    revalidatePath(`/profile/${user?.username}`);
  } catch (err) {}
};
export const updateUser = async (
  prevState: { success: boolean; error: boolean },
  payload: {
    formData: FormData;
    cover: string;
  }
) => {
  const { formData, cover } = payload;
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );

  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ cover, ...filteredFields });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const { userId } = auth();

  if (!userId) {
    return { success: false, error: true };
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const addPost = async (formData: FormData, img: string) => {
  const desc = formData.get("desc") as string;

  const Desc = z.string().min(1).max(255);

  const validatedDesc = Desc.safeParse(desc);

  if (!validatedDesc.success) {
    console.log("description is not valid");
    return;
  }
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.create({
      data: {
        description: validatedDesc.data,
        userId,
        image: img,
      },
    });

    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};
export const switchLike = async (postId: number) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: number, desc: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const createdComment = await prisma.comment.create({
      data: {
        description: desc,
        userId,
        postId,
      },
      include: {
        user: true,
      },
    });

    return createdComment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};
export const deletePost = async (postId: number) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId,
      },
    });
    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};
export const addStory = async (img: string) => {
  const { userId } = auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingStory = await prisma.story.findFirst({
      where: {
        userId,
      },
    });

    if (existingStory) {
      await prisma.story.delete({
        where: {
          id: existingStory.id,
        },
      });
    }
    const createdStory = await prisma.story.create({
      data: {
        userId,
        img,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: true,
      },
    });

    return createdStory;
  } catch (err) {
    console.log(err);
  }
};
