import { lessons, units } from "../../../../db/schema";
import { Banner } from "./banner";
import { LessonButton } from "./lesson-button";

type Props = {
    id: number;
    title: string;
    description: string;
    order: number;
    lessons: (typeof lessons.$inferSelect & { completed: boolean })[];
    activeLesson: (typeof lessons.$inferSelect & { units: typeof units.$inferSelect }) | undefined;
    activeLessonProgress: number;
}

export const Unit = ({ id, title, description, order, lessons, activeLesson, activeLessonProgress }: Props) => {
    return (
        <>
            <Banner title={title} description={description}></Banner>
            <div className="flex items-center flex-col relative">
                {lessons.map((lesson, index) => {
                    const isCurrentLesson = lesson.id === activeLesson?.id;
                    const isLocked = !lesson.completed && !isCurrentLesson;
                    return (
                        <LessonButton
                            key={lesson.id}
                            id={lesson.id}
                            index={index}
                            totalLessons={lessons.length}
                            isCurrentLesson={isCurrentLesson}
                            isLocked={isLocked}
                            activeLessonProgress={activeLessonProgress}
                        >

                        </LessonButton>
                    )
                })}
            </div>
        </>
    )
}
