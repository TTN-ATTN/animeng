import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("initializing database");
        await db.delete(schema.lessons);
        await db.delete(schema.units);
        await db.delete(schema.challenges);
        await db.delete(schema.challOptions);
        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.challProgress);
        console.log("deleted all tables successfully");

        await db.insert(schema.courses).values([
            {
                id: 1,
                title: "beginner",
                imageSrc: "/greenbutton.png",
            },
            {
                id: 2,
                title: "intermediate",
                imageSrc: "/yellowbutton.png",
            },
            {
                id: 3,
                title: "advanced",
                imageSrc: "/redbutton.png",
            },
        ]);


        await db.insert(schema.units).values([
            {
                id: 1,
                courseId: 1,
                title: "Unit 1",
                description: "This is the first unit of the beginner course",
                order: 1,
            },
            {
                id: 2,
                courseId: 2,
                title: "Unit 1",
                description: "This is the first unit of the intermediate course",
                order: 1,
            },
            {
                id: 3,
                courseId: 3,
                title: "Unit 1",
                description: "This is the first unit of the advanced course",
                order: 1,
            }
        ]);


        await db.insert(schema.lessons).values([
            {
                id: 1,
                unitId: 1,
                title: "Lesson 1",
                description: "Learn the basics of the language",
                order: 1,
            },
            {
                id: 2,
                unitId: 1,
                title: "Lesson 2",
                description: "Nouns and verbs",
                order: 2,
            },
            {
                id: 3,
                unitId: 1,
                title: "Lesson 3",
                description: "Adjectives and adverbs",
                order: 3,
            },
            {
                id: 4,
                unitId: 1,
                title: "Lesson 4",
                description: "This is lesson 4",
                order: 4,
            },
            {
                id: 5,
                unitId: 1,
                title: "Lesson 5",
                description: "This is lesson 5",
                order: 5,
            }
        ]);

        await db.insert(schema.challenges).values([
            {
                id: 1,
                lessonId: 1,
                type: "CHOICE",
                question: "Từ nào sau đây có nghĩa là Tiếng Anh?",
                order: 1,
            },
            {
                id: 2,
                lessonId: 1,
                type: "VOICE",
                question: "Động từ nào sau đây có nghĩa là 'ngủ'?",
                order: 2,
            },
            {
                id: 3,
                lessonId: 1,
                type: "SPELLING",
                question: "Động từ nào sau đây có nghĩa là 'đi'?",
                order: 3,
                
            },
            {
                id: 4,
                lessonId: 2,
                type: "WRITING",
                question: "Động từ nào sau đây có nghĩa là 'đi'?",
                order: 4,
            },
            {
                id: 5,
                lessonId: 2,
                type: "WRITING",
                question: "Động từ nào sau đây có nghĩa là 'đi'?",
                order: 5,
            },
        ]);

        await db.insert(schema.challOptions).values([
            {
                challengeId: 1,
                text: "English",
                correct: true,
                imageSrc: "/boy.svg",
                audioSrc: "/english.mp3",
            },
            {
                challengeId: 1,
                text: "Spainish",
                correct: false,
                imageSrc: "/spainish.svg",
                audioSrc: "/spainish.mp3",
            },
            {
                challengeId: 1,
                text: "Japanese",
                correct: false,
                imageSrc: "/japanese.svg",
                audioSrc: "/japanese.mp3",
            },
            {
                challengeId: 1,
                text: "American",
                correct: false,
                imageSrc: "/boy.svg",
                audioSrc: "/es_boy.mp3",
            },
            {
                challengeId: 2,
                text: "sleep",
                correct: true,
                imageSrc: "/japanese.svg",
                audioSrc: "/japanese.mp3",
            },
            {
                challengeId: 2,
                text: "slip",
                correct: false,
                imageSrc: "/japanese.svg",
                audioSrc: "/japanese.mp3",
            },
            {
                challengeId: 3,
                text: "go",
                correct: true,
                imageSrc: "/japanese.svg",
                audioSrc: "/japanese.mp3",
            },
            {

                challengeId: 3,
                text: "eat",
                correct: false,
                imageSrc: "/japanese.svg",
                audioSrc: "/japanese.mp3",
            },
        ]);


        console.log("inilized database successfully");
    }

    catch (err) {
        console.log(err);
        throw new Error("Something went wrong! Cannot initialize database");
    }
};

main();
// how to run: npm run db:initdb