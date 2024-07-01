import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Effect, Either } from "effect";
import { addUser, getUsers } from "./services";
import {WorkOS} from "@workos-inc/node"
import { sealData, unsealData } from "iron-session";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sessionMiddleware, CookieStore } from "hono-sessions";

const app = new Hono();

const store = new CookieStore();

const handleRequest = (path: string): Effect.Effect<Response, unknown, never> =>
  Either.try(() => {
    if (path === "/hello") {
      return new Response("Hello, World!", { status: 200 });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  });
  const handleRedirect = (
    path: string
  ): Effect.Effect<Response, unknown, never> =>
    Either.try(() => {
      if (path === "/login") {
        return new Response("Login Successful!", { status: 200 });
      } else {
        return new Response("Failed to Login", { status: 404 });
      }
    });


app.get("/hello", async (c) => {
  const effect = handleRequest(c.req.path);
  const response = Effect.runSync(effect);
  return response;
});


app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});


app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Custom Error Message", 500);
});

app.get("/users", async (c) => {
  return await getUsers();
});

app.post("/users",async(c)=> {
    try{
        const user = await c.req.json();
        const response = await addUser(user);
        return response;
    }catch(err){
        return new Response("Error adding user", {status:500})
    }
});

const workos = new WorkOS(process.env.WORKOS_API_KEY as string);
const clientId = process.env.WORKOS_CLIENT_ID as string;
const cookiePassword = process.env.COOKIE_PASSWORD as string;

app.use(
  "*",
  sessionMiddleware({
    store,
    encryptionKey: "password_at_least_32_characters_long",
    expireAfterSeconds: 900,
    cookieOptions: {
      sameSite: "Lax",
      path: "/auth",
      httpOnly: true,
    },
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});


export default app;
