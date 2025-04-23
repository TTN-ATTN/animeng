import { getCourses, getUserProgress } from "../../../../db/queries";
import List from "./list";

const CoursePage = async () => {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    return (
        <div className="h-full max-w-[912px] mx-auto px-3">
            <h1 className="text-2xl font-bold text-neutral-700 mt-12">Danh sách khóa học</h1>
            {/* {JSON.stringify(courses)} */}
            <List courses={courses} activeCourseId={userProgress?.activeCourseId}></List>
        </div>
    )
}

export default CoursePage;