import Story from "@/components/Story";
import AddPost from "@/components/AddPost";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftbar/LeftMenu";
import RightMenu from "@/components/rightbar/RightMenu";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

const Home = async () => {
  const signedUser = await currentUser();
  if (!signedUser?.id) return;
  const user = await prisma.user.findFirst({
    where: {
      id: signedUser.id,
    },
  });
  if (!user) {
    await prisma.user.create({
      data: {
        id: signedUser.id,
        username: signedUser.username ? signedUser.username : "",
        name: signedUser.firstName,
        surname: signedUser.lastName,
        avator: signedUser.imageUrl,
      },
    });
  }
  return (
    <div className="flex gap-6 pt-6 min-h-[calc(100vh-96px)]">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%] ">
        <div className="flex flex-col gap-5">
          <Story />
          <AddPost />
          <Feed />
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
};
export default Home;
