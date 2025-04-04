/* 
    Backend: Định nghĩa các truy vấn dữ liệu từ cơ sở dữ liệu
*/

import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { courses, userProgress, units } from "./schema";
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
        with: {lessons: {with: {challenges: {with: {challProgress: true}}}}},
    });

    // Map unit ở trong temp_data 
    const data = temp_data.map((unit) => {
        // Map lesson ở trong unit
        const completedLessons = unit.lessons.map((lesson)=>{
            // Kiểm tra xem tất cả các thử thách trong bài học đã hoàn thành chưa
            const completedChallenges = lesson.challenges.every((challenge) => {
                return challenge.challProgress 
                && challenge.challProgress.length>0 
                && challenge.challProgress.every((cp) => {return cp.completed});
            });

            // Spread operator được sử dụng để sao chép tất cả các thuộc tính của đối tượng lesson vào một đối tượng mới, và thêm thuộc tính completed với giá trị là completedChallenges
            return {...lesson, completed: completedChallenges};
        });

        // Thêm thuộc tính lessons vào đối tượng unit, với giá trị là completedLessons
        return {...unit, lessons: completedLessons};
    });

    return data;
});

