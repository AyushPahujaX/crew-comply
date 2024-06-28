import { defineConfig } from "drizzle-kit";
const database = process.env.DATABASE_URL as string;
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: database
  },
});
