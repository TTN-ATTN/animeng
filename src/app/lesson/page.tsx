import { redirect } from "next/navigation";
import { getLesson, getUserProgress, getUserSubscription} from "../../../db/queries";
import { Quiz } from "./quiz";

const LesssonPage = async () => {
    const lessonData = await getLesson();
    const userProgressData = await getUserProgress();
    const userSubscriptionData = await getUserSubscription();

    const [lesson,userProgress,userSubscription,] = await Promise.all([
        lessonData,
        userProgressData,
        userSubscriptionData,
    ]);

    if(!lesson || !userProgress) redirect("/learning");

    const percent = lesson.challenges.filter((challenge) => challenge.completed).length / lesson.challenges.length * 100; 
   
    // if (lesson.challenges.filter((challenge) => challenge.completed).length == lesson.challenges.length - 1) redirect("/learning");
    return (
        <Quiz 
            lessonId = {lesson.id}
            lessonChallenges = {lesson.challenges}
            hearts = {userProgress.hearts}
            percent = {percent}
            subscription = {userSubscription}    
        >
        </Quiz>
    )
}
export default LesssonPage;