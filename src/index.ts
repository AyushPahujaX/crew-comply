import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Effect, Either } from "effect";

// Create Hono app
const app = new Hono();

// Define a handler with effect-ts
const handleRequest = (path: string): Effect.Effect<Response, unknown, never> =>
  Either.try(() => {
    if (path === "/hello") {
      return new Response("Hello, World!", { status: 200 });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  });

// Define a route
app.get("/hello", async (c) => {
  const effect = handleRequest(c.req.path);
  const response = Effect.runSync(effect);
  return response;
});

// Not Found handler
app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

// Error Handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Custom Error Message", 500);
});

// Start the server
const port = 3000;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});

// For Cloudflare Workers
export default app;
