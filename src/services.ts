import { neon } from "@neondatabase/serverless";
import {drizzle} from "drizzle-orm/neon-http";
import { users } from "./schema";
import 'dotenv/config';
const database = process.env.DATABASE_URL as string;

const db = neon(database);

const data = drizzle(db, { logger:true})

export const getUsers = async () => {
  try {
    const allUsers = await data.select().from(users).execute();
    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error fetching users", { status: 500 });
  }
};