import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import { UserProgress } from "@/components/ui/user-progress";
import { getTopUsers, getUserProgress, getUserSubscription} from "../../../../db/queries";
import { redirect } from "next/navigation";
import { FeedWrapper } from "@/components/ui/feed-wrapper";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Promo } from "@/components/ui/promo";
import { Quests } from "@/components/ui/quests";


const LeaderBoard = async () => {
    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscription();
    const topUserData = await getTopUsers();
    const isPro = !!(await userSubscriptionData)?.isActive;

    const  [ userProgress,
        userSubscription,
        topUser,
     ] = await Promise.all([
        userProgressData,
        userSubscriptionData,
        topUserData,
    ]);
    if (!userProgress || ! userProgress.activeCourse)
    {
        redirect("/courses");
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                activeCourse={userProgress.activeCourse}
                hearts = {userProgress.hearts}
                points = {userProgress.points}
                hasSubscription = {!!userSubscription?.isActive}/>
                {!isPro && (
                    <Promo />
                )}   
                <Quests points={userProgress.points}/>
            </StickyWrapper>
            <FeedWrapper>
                <div className = "w-full flex flex-col items-center">
                <Image src = "/leaderboard.svg" alt = "Shop" height = {90} width = {90}/>
                <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
                    Bảng xếp hạng
                </h1>
                <p className = "text-muted-foreground text-center text-lg mb-6">
                    See where you stand among other learners in the community!
                </p>
                <Separator className="mb-4 h-0.5 rounded-full " />
                {topUser?.map((userProgress, index) => (
                    <div key = {userProgress.userId} className="flex items-center w-full p-2 px-4 rounded-xl hover:bg-gray-200/50"> 
                        <p className="font-bond text-lime-700 mr-4">{index + 1}</p>
                        <Avatar className="w-10 h-10 mr-4" >
                            <AvatarImage className="object-cover" src = {userProgress.userImageSrc} />
                        </Avatar>
                        <p className = "font-bold text-neutral-700 ">
                            {userProgress.userName}
                        </p>
                        <p className = "text-muted-foreground text-lg ml-auto">
                            {userProgress.points} XP
                        </p>
                    </div>
                ))}
                </div>
            </FeedWrapper>
        </div>
    )
}

export default LeaderBoard;