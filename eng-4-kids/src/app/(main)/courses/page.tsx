import { getCourses } from "../../../../db/queries";
import List from "./list";

const CoursePage = async () => {
    const data = await getCourses();
    return (
        <div className="h-full max-w-[912px] mx-auto px-3">
            <h1 className="text-2xl font-bold text-neutral-700">Course Page</h1>
            {/* {JSON.stringify(data)} */}
            {/* <List courses={data} activeCourseId={1} test></List> */}
            <List courses={data} activeCourseId={1}></List>
        </div>
    )
}

export default CoursePage;