import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "../../../db/queries";
import { Quiz } from "./quiz";

const LesssonPage = async () => {
    const lessonData = await getLesson();
    const userProgressData = await getUserProgress();

    const [lesson,userProgress,] = await Promise.all([
        lessonData,
        userProgressData
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
            subscription = {null}    
        >
        </Quiz>
    )
}
export default LesssonPage;