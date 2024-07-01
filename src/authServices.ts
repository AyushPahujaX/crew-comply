import { Context, Next } from "hono";
import { Session } from "hono-sessions";
import { WorkOS } from "@workos-inc/node";
import { Effect } from "effect";

const ApiKey = process.env.WORKOS_API_KEY as string;
const clientID = process.env.WORKOS_CLIENT_ID as string;

const workos = new WorkOS(ApiKey);

const getAuthUrl = () =>
  Effect.succeed(
    workos.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: "http://localhost:3000/callback",
      clientId: clientID,
    })
  );

const authenticateWithCode = (code: string) =>
  Effect.promise(() =>
    workos.userManagement.authenticateWithCode({
      code,
      clientId: clientID,
    })
  );

const loginHandler = async (c: Context) => {
  const authUrl = await Effect.runPromise(getAuthUrl());
  return c.redirect(authUrl as string);
};

const callbackHandler = async (c: Context) => {
  const code = c.req.query("code") as string;
  const { user } = await Effect.runPromise(authenticateWithCode(code));

  const session: Session = c.get("session");
  session.set("user", user);

  return c.redirect("/hello", 302);
};

const isAuthenticated = async (c: Context, next: Next) => {
  const session: Session = c.get("session");
  if (session.get("user")) {
    return await next();
  }
  return c.redirect("/auth");
};

export { loginHandler, isAuthenticated, callbackHandler };
