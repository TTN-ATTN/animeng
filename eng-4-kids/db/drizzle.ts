import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ! có nghĩa là khẳng định rằng tham số truyền vào không bao giờ null hoặc undefined 
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, {schema});

export default db;