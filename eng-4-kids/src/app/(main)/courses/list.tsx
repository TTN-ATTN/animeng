"use client";

import { courses } from "../../../../db/schema";
import { Card } from "./card";

// thuộc tính courses và activeCourseId của component
type Props = {
    courses: typeof courses.$inferSelect[];
    activeCourseId: number;
    test?: boolean;
}

const List = ({ courses, activeCourseId, test }: Props) => {
    return (
        <div>
            <h1>{test ? "Test listing" : ""}</h1>
            <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                {
                    courses.map((course) => {
                        return (
                            <Card
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                imageSrc={course.imageSrc}
                                active={activeCourseId === course.id}
                                onClick={() => {}}
                                disabled={false}
                            />
                        )})
                }
            </div>
        </div>
    );
};

export default List;