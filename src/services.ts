import postgres from "postgres";
import {drizzle} from "drizzle-orm/postgres-js";
import { User, users } from "./schema";
import 'dotenv/config';

const database = process.env.DATABASE_URL as string;

const db = postgres(database);

const data = drizzle(db, { logger:true})



export const getUsers = async () => {
  try {
    const allUsers = await data.select().from(users);
    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error fetching users", { status: 500 });
  }
};

export const addUser = async (user:User) => {
  try {
    const result = await data.insert(users).values(user);
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response("Error adding user", { status: 500 });
  }
};