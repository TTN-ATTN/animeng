import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" }); // Explicitly specify the .env.local file
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});


// npm run db:studio (open drizzle local)