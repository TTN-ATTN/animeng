import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "../../../db/queries";
import { Quiz } from "./quiz";

const LesssonPage = async () => {
    const lesson = await getLesson();
    const userProgress = await getUserProgress();

    if(!lesson || !userProgress) redirect("/learning");

    const percent = lesson.challenges.filter((challenge) => challenge.completed).length / lesson.challenges.length * 100; 
    
    return (
        <Quiz 
            lessonId = {lesson.id}
            lessonChallenges = {lesson.challenges}
            hearts = {userProgress.hearts}
            percent = {percent}
            subscription = {null}    
        >
        </Quiz>
    )
}
export default LesssonPage;