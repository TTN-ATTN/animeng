/* 
    Frontend component: List dùng để hiển thị danh sách khóa học và gọi serverside actions 
*/

"use client";

import { useRouter } from "next/navigation";
import { courses, userProgress } from "../../../../db/schema";
import { Card } from "./card";
import { useTransition } from "react";
import { upsertUserProgress } from "../../../../actions/user-progress";

// thuộc tính courses và activeCourseId của component
type Props = {
    courses: typeof courses.$inferSelect[];
    activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

// Component List hiển thị danh sách khóa học, sắp xếp theo thứ tự độ khó của khóa học
const List = ({ courses, activeCourseId }: Props) => {
    const sortedCourses = [...courses].sort((a, b) => {
        if (a.title === "advanced") return 1;
        if (b.title === "advanced") return -1;
        return 0;
    });

    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const onClick = (id: number) => {
        if(pending)
            return;
        if(id === activeCourseId)
            return router.push("/learning");

        startTransition(() => {
            upsertUserProgress(id);
        })
    }

    return (
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
            {
                sortedCourses.map((course) => (
                    <Card
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        imageSrc={course.imageSrc}
                        active={activeCourseId === course.id}
                        onClick={onClick}
                        disabled={false}
                    />
                ))
            }
        </div>
    );
};

export default List;
