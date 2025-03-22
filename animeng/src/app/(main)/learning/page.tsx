import { FeedWrapper } from "@/components/ui/feed-wrapper";
import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import { Header2 } from "../header";
import { UserProgress } from "@/components/ui/user-progress";
import { getUserProgress } from "../../../../db/queries";
import { redirect } from "next/navigation";


export default async function LearningPage(){
    const userProgress = await getUserProgress();

    // Nếu không có khóa học đang học thì redirect về trang danh sách khóa học
    if(!userProgress || !userProgress.activeCourse){
        redirect("/courses");
    }

    return(
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper><UserProgress 
                activeCourse={{title: "beginner", imageSrc: "/greenbutton.png"}}
                hearts={10}
                points={100}
                hasSubscription={false}
            />
            </StickyWrapper>
            <FeedWrapper><Header2 title="Khóa cơ bản"/></FeedWrapper>
        </div>
    );
}