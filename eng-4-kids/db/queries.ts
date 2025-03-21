import {cache} from "react";
import db from "./drizzle";

// cache được dùng để lưu trữ dữ liệu tạm thời, giúp giảm thiểu việc truyền Props 
export const getCourses = cache(
    async() => {
        const data = await db.query.courses.findMany();
        return data;
    }
)