/* 
    Backend: sử dụng Next.js Server Actions và thao tác với database thông qua Drizzle ORM
*/

"use server";

import { getCourseById, getUserFromDB, getUserProgress, getUserSubscription } from "../db/queries";
import { challProgress, userProgress, challenges } from "../db/schema";
import db from "../db/drizzle";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {and, eq } from "drizzle-orm";
import { POINTS_TO_REFILL } from "../constants";
import { auth } from "@/auth";


export const upsertUserProgress = async (courseId: number) => {
    const session  = await auth();
    const userId = session?.user.id;
    // console.log("Courese ID:", courseId);
    if (!session)
        throw new Error("Không có quyền truy cập");

    const course = await getCourseById(courseId);
    // console.log("Courese ID:", courseId);

    if (!course)
        throw new Error("Không tìm thấy khóa học");
    // console.log("Courese ID:", courseId);

    if (!course.units.length || !course.units[0].lessons.length) 
    {
        throw new Error("Khóa học không có bài học nào");
    }
    // console.log("Courese ID:", courseId);

    const existingUserProgress = await getUserProgress();
    // console.log("Existing User Progress:", existingUserProgress);
    if (existingUserProgress?.activeCourseId) {
        await db.update(userProgress).set({
            activeCourseId: courseId,
        });
        // console.log("this step");
        revalidatePath("/courses");
        revalidatePath("/learning");
        redirect("/learning");
    }
    // console.log("Courese ID:", courseId);

    await db.insert(userProgress).values({
        userId: userId!,
        activeCourseId: courseId
    });
    // console.log("Courese ID:", courseId);
    revalidatePath("/courses");
    revalidatePath("/learning");
    redirect("/learning");
};

export const reduceHearts = async (challengeId : number) => {
    const session = await auth();
    const userId = session?.user.id;
    // console.log("User ID:", userId);
    // console.log("Session:", session);
    if (!session || !userId)
    {
        throw new Error("Unauthorized");
    }   
    // console.log("This step");

    const currentUserProgress = await getUserProgress();
    const userSubscription = await getUserSubscription();

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id,challengeId),
    });

    if (!challenge)
    {
        throw new Error("Challenge not found");
    }

    const lessonId = challenge.lessonId;

    const existingChallengeProgress = await db.query.challProgress.findFirst({
        where: and(
            eq(challProgress.userId,userId!),
            eq(challProgress.challengeId,challengeId),),
    });
    const isPractise = !!existingChallengeProgress;
    if (isPractise)
    {
        return{error: "practice"};
    }

    if (!currentUserProgress)
    {
        throw new Error("user progress not found");
    }

    if (userSubscription?.isActive)
    {
        return {error: "subscription"};
    }

    if (currentUserProgress.hearts === 0)
    {
        return {error: "hearts"};
    }

    await db.update(userProgress).set({
        hearts: Math.max((currentUserProgress.hearts ?? 0) - 1, 0),
    }).where(eq(userProgress.userId,userId!))

    revalidatePath("/shop");
    revalidatePath("/learning");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);

};

export const refillHearts =  async() =>{
    const currentUserProgress = await getUserProgress();

    if (!currentUserProgress)
    {
        throw new Error("user progress not found");
    }
    if (!currentUserProgress.userId) {
         throw new Error("User ID not found in user progress data.");
    }
    if ((currentUserProgress.hearts ?? 0)  === 5)
    {
        throw new Error("Hearts are already full")
    }

    if ((currentUserProgress.points ?? 0) < POINTS_TO_REFILL)
    {
        throw new Error("Not enough points");
    }
    // update the points after refilling hearts
    await db.update(userProgress).set({

        hearts: 5,
        points: (currentUserProgress.points ?? 0) - POINTS_TO_REFILL,
    }).where (eq(userProgress.userId,currentUserProgress.userId));
    revalidatePath("/shop");
    revalidatePath("/learning");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    
};