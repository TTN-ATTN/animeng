import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("Resetting the database");
        await db.delete(schema.lessons);
        await db.delete(schema.units);
        await db.delete(schema.challenges);
        await db.delete(schema.challOptions);
        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.challProgress);
        console.log("Reset all database");
    }        
    catch (err) {
        console.log(err);
        throw new Error("Failed to reset the database");
    }
};

main();
// how to run: npm run db:initdb