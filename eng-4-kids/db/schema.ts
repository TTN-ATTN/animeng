import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    serial,
    text
} from "drizzle-orm/pg-core";

// Định nghĩa bảng "courses" chứa thông tin các khóa học
export const courses = pgTable("courses", {
    id: serial("id").primaryKey(), // Khóa chính tự tăng
    title: text("title").notNull(), // Tiêu đề khóa học
    imageSrc: text("image_src").notNull(), // Đường dẫn ảnh minh họa
});

// Định nghĩa quan hệ của bảng "courses"
export const coursesRelations = relations(courses, ({ many }) => ({
    userProgress: many(userProgress), // Một khóa học có nhiều người dùng học
}));

// Định nghĩa bảng "user_progress" lưu tiến trình của người dùng
export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey(), // Khóa chính là ID của người dùng
    userName: text("user_name").notNull().default("User"), // Tên người dùng mặc định
    userImageSrc: text("user_image_src").notNull().default("/mascot.png"), // Ảnh đại diện mặc định
    activeCourseId: integer("active_course_id").references(() => 
        courses.id, { onDelete: "cascade" } // Khóa ngoại tham chiếu đến khóa học
    ),
    hearts: integer("hearts").notNull().default(5), // Số lượt chơi còn lại
    points: integer("points").notNull().default(0), // Điểm số
});

// Định nghĩa quan hệ của bảng "user_progress"
export const userProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id], // Một user chỉ có một khóa học đang học
    })
}));
