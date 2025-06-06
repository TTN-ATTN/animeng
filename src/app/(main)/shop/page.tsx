import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import { UserProgress } from "@/components/ui/user-progress";
import { getUserProgress, getUserSubscription } from "../../../../db/queries";
import { redirect } from "next/navigation";
import { FeedWrapper } from "@/components/ui/feed-wrapper";
import Image from "next/image";
import { Items } from "./items";
import { Quests } from "@/components/ui/quests";

export const dynamic = "force-dynamic"; // Force dynamic rendering

const ShopPage = async () => {
    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscription();
    
    const  [ userProgress,
        userSubscription
     ] = await Promise.all([
        userProgressData,
        userSubscriptionData
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
                hearts = {userProgress.hearts ?? 0} 
                points = {userProgress.points ?? 0}
                hasSubscription = {!!userSubscription?.isActive}/>
                <Quests points={userProgress.points ?? 0}/> 
            </StickyWrapper>
            <FeedWrapper>
                <div className = "w-full flex flex-col items-center">
                <Image src = "/shop.svg" alt = "Shop" height = {90} width = {90}/>
                <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
                    Shop
                </h1>
                <p className = "text-muted-foreground text-center text-lg mb-6">
                    Spend your points on items to help you in your learning journey!
                </p>
                <Items 
                hearts = {userProgress.hearts ?? 0} // Added ?? 0
                points = {userProgress.points ?? 0} // Added ?? 0
                hasSubscription = {!!userSubscription?.isActive}/>

                </div>
            </FeedWrapper>
        </div>
    )
}

export default ShopPage;

