import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import { UserProgress } from "@/components/ui/user-progress";
import { getTopUsers, getUserProgress, getUserSubscription} from "../../../../db/queries";
import { redirect } from "next/navigation";
import { FeedWrapper } from "@/components/ui/feed-wrapper";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Promo } from "@/components/ui/promo";
import { quests } from "../../../../constants"

const QuestPage = async () => {
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
            </StickyWrapper>
            <FeedWrapper>
                <div className = "w-full flex flex-col items-center">
                <Image src = "/quests.svg" alt = "Shop" height = {90} width = {90}/>
                <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
                    Nhiệm vụ
                </h1>
                <p className = "text-muted-foreground text-center text-lg mb-6">
                    Làm bài tập hàng ngày để kiếm điểm và mở khóa các phần thưởng hấp dẫn!
                </p>
                <ul className="w-full">
                    {quests.map((quest) => {
                        const progress = (userProgress.points / quest.value) * 100;

                        return (
                            <div key={quest.title} className="flex item-center w-full p-4 gap-x-4 border-t-2">
                                <Image src = "/points.png" alt = "Points" width = {60} height = {60}/>
                                <div className = "flex flex-col w-full gap-y-2">
                                    <p className="text-neutral-700 text-lg font-bold">
                                        {quest.title}
                                    </p>
                                    <Progress value={progress} className="h-4 "/>
                                </div>
                            </div>
                            
                        )
                    })}
                </ul>
                </div>
            </FeedWrapper>
        </div>
    )
}

export default QuestPage;