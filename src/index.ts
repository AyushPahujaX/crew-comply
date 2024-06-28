import { serve } from "@hono/node-server";
import { addUser, getUsers } from "./services";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { TypedResponse } from "hono";
import { z } from "zod";

const app = new OpenAPIHono();

const basicRoute = createRoute({
  method: "get",
  path: "/basic/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            hello: z.string(),
          }),
        },
      },
      description: "say hello",
    },
  },
});

app.openapi(basicRoute, (c) => {
  return c.json({ hello: "world" }, 200);
});

const getUsersRoute = createRoute({
  method: "get",
  path: "/users",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
            })
          ),
        },
      },
      description: "Get all users",
    },
  },
});


app.openapi(
  getUsersRoute,
  async (c): Promise<T<[{ id: number; name: string; email: string }]>> => {
    return await getUsers();
  }
);
const addUserRoute = createRoute({
  method: "post",
  path: "/users",
  requestBody: {
    content: {
      "application/json": {
        schema: z
          .object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
          })
          .nonstrict(), // Use nonstrict() to avoid strict validation
      },
    },
    required: true, // Define required as true for requestBody
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
          }),
        },
      },
      description: "User added successfully",
    },
    500: {
      description: "Error adding user",
    },
  },
});
app.openapi(addUserRoute, async (c) => {
  try {
    const user = await c.req.json();
    const response = await addUser(user);
    return response;
  } catch (err) {
    return new Response("Error adding user", { status: 500 });
  }
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Crew Comply",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Custom Error Message", 500);
});

const port = 3000;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});

export default app;
