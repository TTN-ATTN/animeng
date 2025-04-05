/* 
    Backend: Định nghĩa các truy vấn dữ liệu từ cơ sở dữ liệu
*/

import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { courses, userProgress, units, challProgress, lessons } from "./schema";
import { eq } from "drizzle-orm";

// cache được dùng để lưu trữ dữ liệu tạm thời, giúp giảm thiểu việc truyền Props 
export const getCourses = cache(
    async () => {
        const data = await db.query.courses.findMany();
        return data;
    }
)

export const getUserProgress = cache(
    async () => {
        const { userId } = await auth();
        if (!userId) return null;
        const data = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
            with: {
                activeCourse: true
            }
        });

        return data;
    }
);

export const getCourseById = cache(
    async (courseId: number) => {
        const data = await db.query.courses.findFirst({
            where: eq(courses.id, courseId)
        });
        return data;
    }
);

export const getUnits = cache(async () => {
    const userProgress = await getUserProgress();
    const userId = await auth();
    if (!userId || !userProgress?.activeCourseId) return [];

    const temp_data = await db.query.units.findMany({
        where: eq(units.courseId, userProgress.activeCourseId),
        with: { lessons: { with: { challenges: { with: { challProgress: true } } } } },
    });

    // Map unit ở trong temp_data 
    const data = temp_data.map((unit) => {
        // Map lesson ở trong unit
        const completedLessons = unit.lessons.map((lesson) => {
            if(lesson.challenges.length === 0) return { ...lesson, completed: false };
            // Kiểm tra xem tất cả các thử thách trong bài học đã hoàn thành chưa
            const completedChalls = lesson.challenges.every((challenge) => {
                return challenge.challProgress
                    && challenge.challProgress.length > 0
                    && challenge.challProgress.every((cp) => { return cp.completed });
            });

            // Spread operator được sử dụng để sao chép tất cả các thuộc tính của đối tượng lesson vào một đối tượng mới, và thêm thuộc tính completed với giá trị là completedChalls
            return { ...lesson, completed: completedChalls };
        });

        // Thêm thuộc tính lessons vào đối tượng unit, với giá trị là completedLessons
        return { ...unit, lessons: completedLessons };
    });

    return data;
});

export const getCourseProgress = cache(async () => {
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) return null;

    const unitsInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    unit: true,
                    challenges: {
                        with: {
                            challProgress: {
                                where: eq(challProgress.userId, userId),
                            }
                        }
                    }
                }
            }
        }
    });

    const firstUncompletedLesson = unitsInActiveCourse.flatMap((unit) => unit.lessons).find((lesson)=>{
        return lesson.challenges.some((
            challenge => {
                return !challenge.challProgress || challenge.challProgress.length === 0 ||
                challenge.challProgress.some((cp) => !cp.completed);
            }
        ))
    });

    return{
        activeLesson: firstUncompletedLesson,
        activeLessonId: firstUncompletedLesson?.id
    };
});

export const getLesson = cache(
    async (id?: number) => {
        const { userId } = await auth();
        const courseProegress = await getCourseProgress();
        const  lessonId = id || courseProegress?.activeLessonId;
        if (!lessonId || !userId) return null;

        const data = await db.query.lessons.findFirst({
            where: eq(lessons.id, lessonId),
            with:{
                challenges:{
                    orderBy: (challenges, { asc }) => [asc(challenges.order)],
                    with:{
                        challOptions: true,
                        challProgress:{where: eq(challProgress.userId, userId)},
                    }
                }
            }
        });

        if(!data || !data.challenges) return null;

        const challs = data.challenges.map((challenge) => {
            const completed = challenge.challProgress && challenge.challProgress.length > 0 && challenge.challProgress.every((cp) => cp.completed);
            return { ...challenge, completed };
        });

        return {...data, challenges: challs };
    }
);

export const getLessonPercent = cache(
    async () => {
        const courseProgress = await getCourseProgress();
        if(!courseProgress?.activeLessonId) return 0;
        const lesson = await getLesson(courseProgress.activeLessonId);

        if(!lesson) return 0;

        const completedChalls = lesson.challenges.filter((challenge) => challenge.completed);
        const p = (completedChalls.length / lesson.challenges.length) * 100;
        const percent = Math.round(p);

        return percent;
    }
);
