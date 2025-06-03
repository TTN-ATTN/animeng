/*
    Backend: Định nghĩa cấu trúc dữ liệu cho cơ sở dữ liệu
*/

import { relations } from "drizzle-orm";
import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

// --- NextAuth Tables ---

export const users = pgTable("users", {
    id: text("id").notNull().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
});

export const accounts = pgTable(
    "accounts",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({ columns: [account.provider, account.providerAccountId] }),
    ]
);

export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationTokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

// --- Application Tables (Modified for NextAuth) ---

// Định nghĩa bảng "courses" chứa thông tin các khóa học
export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("image_src").notNull(),
});

// Định nghĩa quan hệ của bảng "courses"
export const coursesRelations = relations(courses, ({ many }) => ({
    userProgress: many(userProgress),
    units: many(units),
}));

// Định nghĩa bảng units
export const units = pgTable("units", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    courseId: integer("course_id").references(() =>
        courses.id, { onDelete: "cascade" }
    ).notNull(),
    order: integer("order").notNull(),
});

// Định nghĩa quan hệ của bảng "units", nhiều unit thuộc về một khóa học, một unit có nhiều bài học
export const unitsRelations = relations(units, ({many, one }) => ({
    course: one(courses, {
        fields: [units.courseId],
        references: [courses.id],
    }),
    lessons: many(lessons),
}));

// Định nghĩa bảng lessons
export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    unitId: integer("unit_id").references(() =>
        units.id, { onDelete: "cascade" }
    ).notNull(),
    order: integer("order").notNull(),
});

// Định nghĩa quan hệ của bảng "lessons", nhiều bài học thuộc về một unit, một bài học có nhiều thử thách
export const lessonsRelations = relations(lessons, ({many, one}) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.id],
    }),
    challenges: many(challenges),
}));

export const challEnum =  pgEnum("type", ["CHOICE" ,"SPELLING", "VOICE", "WRITING"]);
// Suy nghĩ lại về voice có nên lm hay không ?.


export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    type: challEnum("type").notNull(),
    question: text("question").notNull(),
    order: integer("order").notNull(),
});

export const challengesRelations = relations(challenges,({many, one})=>({
    lesson: one(lessons,{
        fields: [challenges.lessonId],
        references: [lessons.id],
    }),
    challOptions: many(challOptions),
    challProgress: many(challProgress),
}))

// Định nghĩa bảng chứa các tùy chọn cho thử thách
export const challOptions = pgTable("challOptions", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    text: text("text").notNull(),
    correct: boolean("correct").notNull().default(false),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
});

// Định nghĩa quan hệ của bảng chứa các tùy chọn cho thử thách, một tùy chọn thuộc về một thử thách duy nhất
export const challOptionsRelations = relations(challOptions,({one})=>({
    challenge: one(challenges, {
        fields: [challOptions.challengeId],
        references: [challenges.id],
    }),
}));

// Định nghĩa bảng lưu tiến trình của người dùng trong các thử thách
export const challProgress = pgTable("challProgress", {
    id: serial("id").primaryKey(),
    // userId: text("user_id").notNull(), // Old Clerk ID
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // New NextAuth ID
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").notNull().default(false),
});

// Định nghĩa quan hệ của bảng lưu tiến trình của người dùng trong các thử thách, một thử thách có một tiến trình
export const challProgressRelations = relations(challProgress, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challProgress.challengeId],
        references: [challenges.id],
    }),
    user: one(users, {
        fields: [challProgress.userId],
        references: [users.id],
    }),
}));

// Định nghĩa bảng "user_progress" lưu tiến trình của người dùng
export const userProgress = pgTable("user_progress", {
    // userId: text("user_id").primaryKey(), // Old Clerk ID as PK
    userId: text("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }), // New NextAuth ID as PK & FK
    // userName: text("user_name").notNull().default("User"), // Removed, use users.name
    // userImageSrc: text("user_image_src").notNull().default("/anime-girl-reading.gif"), // Removed, use users.image
    activeCourseId: integer("active_course_id").references(() =>
        courses.id, { onDelete: "cascade" }
    ),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
});

// Định nghĩa quan hệ của bảng "user_progress"
export const userProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
    user: one(users, {
        fields: [userProgress.userId],
        references: [users.id],
    }),
}));

export const userSubscription = pgTable("user_subscription", {
    id: serial("id").primaryKey(),
    // userId: text("user_id").notNull().unique(), // Old Clerk ID
    userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }), // New NextAuth ID
    momoCustomerId: text("stripe_customer_id").notNull().unique(), // Change Stripe to momo relate partnercode
    momoSubscriptionId: text("stripe_subscription_id").notNull().unique(), // Change Stripe to momo
    momoPriceId: text("stripe_price_id").notNull(),
    momoCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

// Add relation for userSubscription to user
export const userSubscriptionRelations = relations(userSubscription, ({ one }) => ({
    user: one(users, {
        fields: [userSubscription.userId],
        references: [users.id],
    }),
}));

// Add relations for users table
export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
    userProgress: many(userProgress),
    challProgress: many(challProgress),
    userSubscription: many(userSubscription),
}));

