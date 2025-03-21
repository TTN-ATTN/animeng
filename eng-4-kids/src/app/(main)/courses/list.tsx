"use client";

import { courses, userProgress } from "../../../../db/schema";
import { Card } from "./card";

// thuộc tính courses và activeCourseId của component
type Props = {
    courses: typeof courses.$inferSelect[];
    activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
    test?: boolean;
};

// Component List hiển thị danh sách khóa học, sắp xếp theo thứ tự độ khó của khóa học
const List = ({ courses, activeCourseId, test }: Props) => {
    const sortedCourses = [...courses].sort((a, b) => {
        if (a.title === "advanced") return 1;
        if (b.title === "advanced") return -1;
        return 0;
    });

    return (
        <div>
            <h1>{test ? "Test listing" : ""}</h1>
            <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                {
                    sortedCourses.map((course) => (
                        <Card
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            imageSrc={course.imageSrc}
                            active={activeCourseId === course.id}
                            onClick={() => {}}
                            disabled={false}
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default List;
