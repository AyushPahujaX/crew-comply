import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Effect, Either } from "effect";
import { getUsers } from "./services";


const app = new Hono();

const handleRequest = (path: string): Effect.Effect<Response, unknown, never> =>
  Either.try(() => {
    if (path === "/hello") {
      return new Response("Hello, World!", { status: 200 });
    } else {
      return new Response("Not Found", { status: 404 });
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

const port = 3000;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});


export default app;
