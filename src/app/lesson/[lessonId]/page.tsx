import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "../../../../db/queries";
import { Quiz } from "../quiz";

type Props = {
    params: {
        lessonId: number;
    };
};

const LesssonIdPage = async ({params,} : Props) => {
    const lessonData = await getLesson(params.lessonId);
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
            subscription = {null}   //add user subscription later 
        >
        </Quiz>
    )
}
export default LesssonIdPage;