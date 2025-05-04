/* 
    Backend: sử dụng Next.js Server Actions và thao tác với database thông qua Drizzle ORM
*/

"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getCourseById, getUserProgress, getUserSubscription } from "../db/queries";
import { challProgress, userProgress, challenges } from "../db/schema";
import db from "../db/drizzle";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {and, eq } from "drizzle-orm";
import { upsertChallengeProgess } from "./challenge-progess";
import { matchesGlob } from "path";
import { get } from "http";

const POINTS_TO_REFILL  = 10;

export const upsertUserProgress = async (courseId: number) => {
    const { userId } = await auth();
    const user = await currentUser();


    if (!userId || !user)
        throw new Error("Không có quyền truy cập");

    const course = await getCourseById(courseId);

    if (!course)
        throw new Error("Không tìm thấy khóa học");

    if (!course.units.length || !course.units[0].lessons.length) 
    {
        throw new Error("Khóa học không có bài học nào");
    }
    const existingUserProgress = await getUserProgress();

    if (existingUserProgress) {
        await db.update(userProgress).set({
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg",
        });
        revalidatePath("/courses");
        revalidatePath("/learning");
        redirect("/learning");
    }

    await db.insert(userProgress).values({
        userId,
        activeCourseId: courseId,
        userName: user.firstName || "User",
        userImageSrc: user.imageUrl || "/mascot.svg"
    });
    

    revalidatePath("/courses");
    revalidatePath("/learning");
    redirect("/learning");
};

export const reduceHearts = async (challengeId : number) => {
    const { userId} = await auth();

    if (!userId)
    {
        throw new Error("Unauthorized");
    }

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
            eq(challProgress.userId,userId),
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
        hearts: Math.max(currentUserProgress.hearts - 1, 0),
    }).where(eq(userProgress.userId,userId))

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
    if (currentUserProgress.hearts  === 5)
    {
        throw new Error("Hearts are already full")
    }

    if (currentUserProgress.points < POINTS_TO_REFILL)
    {
        throw new Error("Not enough points");
    }
    // update the points after refilling hearts
    await db.update(userProgress).set({

        hearts: 5,
        points: currentUserProgress.points - POINTS_TO_REFILL,
    }).where (eq(userProgress.userId,currentUserProgress.userId));
    revalidatePath("/shop");
    revalidatePath("/learning");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    
};