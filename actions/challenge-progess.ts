"use server";

import { getUserProgress, getUserSubscription } from "../db/queries";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import db from "../db/drizzle";
import { challenges, challProgress, userProgress } from "../db/schema";
import { revalidatePath } from "next/cache";
import { usePageLeave, usePromise } from "react-use";

export const upsertChallengeProgess = async (challengeId: number) => 
{
    const {userId} = await auth();

    if (!userId)
    {
        throw new Error("Unauthorized");
    }

    const currentUserProgress = await getUserProgress();
    // handle subscription query later
    const userSubscription = await getUserSubscription(); 


    if (!currentUserProgress)
    {
        throw new Error("user progress not found");
    }

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id,challengeId)
    });

    if (!challenge)
    {
        throw new Error("Challenge not found");
    }

    const lessonId = challenge.lessonId;

    const existingChallengeProgress = await db.query.challProgress.findFirst(
        {
            where: and
            (
                eq(challProgress.userId,userId),
                eq(challProgress.challengeId, challengeId),
            ),
        }
    );

    //practice again or run out of hears

    const isPractice = !!existingChallengeProgress;

    if (currentUserProgress.hearts === 0 && !isPractice && !userSubscription?.isActive)
    {
        return {error: "hearts"};
    }

    if (isPractice)
    {
        await db.update(challProgress).set({completed:true,}).where (
            eq(challProgress.id, existingChallengeProgress.id)
        );

        await db.update(userProgress).set({
            hearts: Math.min(currentUserProgress.hearts + 1, 5),
            points: currentUserProgress.points + 10, 

        }).where(eq(userProgress.userId,userId));

        // update content with lastest data
        revalidatePath("/learning");
        revalidatePath("/lesson");
        revalidatePath("/quests");
        revalidatePath("/leaderboard");
        revalidatePath(`/lesson/${lessonId}`);
        return;
    }
   

    await db.insert(challProgress).values({
        challengeId,
        userId,
        completed: true,
    });

    await db.update(userProgress).set(
        {
            points: currentUserProgress.points + 10,
        } 
    ) .where (eq(userProgress.userId,userId));
     
    // update content with lastest data
    revalidatePath("/learning");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
     


};