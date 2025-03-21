/* 
    Backend: sử dụng Next.js Server Actions và thao tác với database thông qua Drizzle ORM
*/

"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getCourseById, getUserProgress } from "../db/queries";
import { userProgress } from "../db/schema";
import db from "../db/drizzle";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export const upsertUserProgress = async (courseId: number) => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user)
        throw new Error("Không có quyền truy cập");

    const course = await getCourseById(courseId);

    if (!course)
        throw new Error("Không tìm thấy khóa học");

    const existingUserProgress = await getUserProgress();

    if (existingUserProgress) {
        await db.update(userProgress).set({
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg"
        }).where(eq(userProgress.userId, userId));
    }

    else {
        await db.insert(userProgress).values({
            userId,
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg"
        })
    }

    revalidatePath("/courses");
    revalidatePath("/learning");
    redirect("/learning");
}