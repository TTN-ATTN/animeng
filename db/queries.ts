/* 
    Backend: Định nghĩa các truy vấn dữ liệu từ cơ sở dữ liệu
*/
import db from "./drizzle";
// import { auth } from "@clerk/nextjs/server"; // Removed Clerk auth
import { auth } from "@/auth"; // Import NextAuth config
import { courses, userProgress, units, challProgress, lessons, userSubscription, users, verificationTokens } from "./schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { createHash } from 'crypto';
import { hashMd5 } from "@/lib/password";

// Helper function to get NextAuth session
const getSession = async () => {
    const session = await auth(); // Use NextAuth's auth()
    return session;
}

// cache được dùng để lưu trữ dữ liệu tạm thời, giúp giảm thiểu việc truyền Props 
export const getCourses = 
    async () => {
        const data = await db.query.courses.findMany();
        return data;
    }


export const getUserProgress = 
    async () => {
        const session = await getSession();
        const userId = session?.user.id;
        // console.log("User ID:", userId);
        if (!userId) return null;
        const data = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
            with: {
                activeCourse: true,
                // Include user data if needed, though userProgress no longer stores name/image
                // user: true 
            }
        });
        // console.log("User Progress Data:", data);
        // Combine with user data from session or users table if needed
        // Example: Fetch user name/image separately if not in session
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { name: true, image: true }
        });

        return {
            ...data,
            // userName: user?.name ?? "User",
            // userImageSrc: user?.image ?? "/anime-girl-reading.gif",
        };
    };

export const getCourseById = 
    async (courseId: number) => {
        const data = await db.query.courses.findFirst({
            where: eq(courses.id, courseId),
            with: {
                units: {
                    orderBy: (units, { asc }) => [asc(units.order)],
                    with: {
                        lessons: {
                            orderBy: (lessons, { asc }) => [asc(lessons.order)],
                        },
                    },
                },
            },
        });
        return data;
    };

export const getUnits = async () => {
    const session = await getSession();
    const userId = session?.user?.id;
    const userProgressData = await getUserProgress(); // Use the modified getUserProgress
    
    if (!userId || !userProgressData?.activeCourseId) return [];

    const temp_data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgressData.activeCourseId),
        with: { 
            lessons: { 
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: { 
                    challenges: { 
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: { 
                            // Filter challProgress by the current user ID
                            challProgress: {
                                where: eq(challProgress.userId, userId)
                            } 
                        } 
                    } 
                } 
            } 
        },
    });

    // Map unit ở trong temp_data 
    const data = temp_data.map((unit) => {
        // Map lesson ở trong unit
        const completedLessons = unit.lessons.map((lesson) => {
            if(lesson.challenges.length === 0) return { ...lesson, completed: false };
            // Kiểm tra xem tất cả các thử thách trong bài học đã hoàn thành chưa
            const completedChalls = lesson.challenges.every((challenge) => {
                // Check the filtered challProgress for the current user
                return challenge.challProgress
                    && challenge.challProgress.length > 0
                    && challenge.challProgress.every((cp) => cp.completed);
            });

            // Spread operator được sử dụng để sao chép tất cả các thuộc tính của đối tượng lesson vào một đối tượng mới, và thêm thuộc tính completed với giá trị là completedChalls
            return { ...lesson, completed: completedChalls };
        });

        // Thêm thuộc tính lessons vào đối tượng unit, với giá trị là completedLessons
        return { ...unit, lessons: completedLessons };
    });

    return data;
};

export const getCourseProgress = async () => {
    const session = await getSession();
    const userId = session?.user?.id;
    const userProgressData = await getUserProgress(); // Use modified getUserProgress

    if (!userId || !userProgressData?.activeCourseId) return null;

    const unitsInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgressData.activeCourseId),
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
                // Check the filtered challProgress for the current user
                return !challenge.challProgress || challenge.challProgress.length === 0 ||
                challenge.challProgress.some((cp) => !cp.completed);
            }
        ))
    });

    return{
        activeLesson: firstUncompletedLesson,
        activeLessonId: firstUncompletedLesson?.id
    };
};

export const getLesson = 
    async (id?: number) => {
        const session = await getSession();
        const userId = session?.user?.id;
        const courseProgressData = await getCourseProgress(); // Use modified getCourseProgress
        const lessonId = id || courseProgressData?.activeLessonId;
        
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

        const normalizedChallenges = data.challenges.map((challenge) => {
            // Check the filtered challProgress for the current user
            const completed = challenge.challProgress && challenge.challProgress.length > 0 && challenge.challProgress.every((cp) => cp.completed);
            return { ...challenge, completed };
        });

        return {...data, challenges: normalizedChallenges };
    };

export const getLessonPercent = 
    async () => {
        const courseProgressData = await getCourseProgress(); // Use modified getCourseProgress
        if(!courseProgressData?.activeLessonId) return 0;
        const lessonData = await getLesson(courseProgressData.activeLessonId); // Use modified getLesson

        if(!lessonData) return 0;

        const completedChalls = lessonData.challenges.filter((challenge) => challenge.completed);
        const p = (completedChalls.length / lessonData.challenges.length) * 100;
        const percent = Math.round(p);

        return percent;
    };


export const getUserSubscription = async () => {
    const session = await getSession();
    const userId = session?.user?.id;
    if(!userId) return null;
    const data = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, userId),
    })

    if (!data) return null;
    const isActive = 
        data.momoPriceId &&
        data.momoCurrentPeriodEnd?.getTime() + 1000 * 60 * 60 * 24 * 7 > Date.now();
    return {
        ...data,
        isActive: !!isActive,   
    };
}

// Lấy ra danh sách người học hàng đầu
export const getTopUsers = async () => {
    // This function might need adjustment depending on how leaderboard is displayed
    // It currently fetches from userProgress, which no longer has name/image directly
    // We might need to join with the users table
    
    // const session = await getSession();
    // const userId = session?.user?.id;
    // if(!userId) return []; // Return empty array if not logged in?

    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 50,
        with: {
            user: { // Join with users table to get name and image
                columns: {
                    id: true,
                    name: true,
                    image: true,
                }
            }
        },
        columns: {
            userId: true,
            points: true,
        },
    });

    // Map the data to include userName and userImageSrc for compatibility
    const formattedData = data.map(progress => ({
        userId: progress.userId,
        userName: progress.user?.name ?? "User",
        userImageSrc: progress.user?.image ?? "/anime-girl-reading.gif",
        points: progress.points,
    }));

    return formattedData;
}


export const getUserFromDB = async (email: string) => {

    const data = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
            id: true,
            email: true,
            pwdhash: true,
            name: true,
            image: true,
        }
    });
    return data;
};

export const insertUser = async (email: string, pwdhash: string, name: string, image:string) => {
    const userid = hashMd5(email, name);
    const data = await db.insert(users).values({
        id: userid,
        email: email,
        pwdhash: pwdhash,
        name: name
    }).returning();
    return data[0];
}

export const inserUserOauth = async (UserId: string, email:string, pwdhash: string, name: string, image: string) => {
    const data = await db.insert(users).values({
        id: UserId,
        email: email,
        pwdhash: pwdhash,
        name: name,
        image: image,
    }).returning();
    return data[0];
}

export const getUserById = async (userId: string) => {
    const data = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            email: true,
            name: true,
            image: true,
        }
    });
    return data;
}

export const updateToken = async (userId: string, token: string, expires: Date) => {
    const data = await db.insert(verificationTokens).values({
        identifier: userId,
        token: token,
        expires: expires,
    });
    return data;
}

export const getToken = async (token: string) => {
    const data = await db.query.verificationTokens.findFirst({
        where: eq(verificationTokens.token, token),
        columns:{
            identifier: true,
            expires: true,
        }
    })
    const isValid = data && data.expires.getTime() > Date.now();
    return {
        ...data,
        isValid: isValid
    }
}

export const deleteToken = async (token: string) => {
    const data = await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    return data;
}

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const data = await db.update(users)
    .set({ pwdhash: newPassword })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    });

  return data[0]; // Return the updated user object
};

export const deleteTokenByToken = async (token: string) => {
    const data = await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    return data;
}