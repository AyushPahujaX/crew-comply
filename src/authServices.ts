import { Context, Next } from "hono";
import { Session } from "hono-sessions";
import { WorkOS } from "@workos-inc/node";
import app from ".";


const ApiKey = process.env.WORKOS_API_KEY as string;
const clientID = process.env.WORKOS_CLIENT_ID as string;

const workos = new WorkOS( ApiKey);

const loginHandler = async (c: Context) => {
  const authUrl = workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: "http://localhost:3000/callback",
    clientId: clientID,
  });

  return c.redirect(authUrl);
};

const callbackHandler = async (c: Context) => {
  const code = c.req.query("code") as string;
  const { user } = await workos.userManagement.authenticateWithCode({
    code,
    clientId: clientID,
  });

  const session: Session = c.get("session");
  session.set("user", user);

  return c.redirect("/hello", 302);
};

const isAuthenticated = (c: Context, next: Next) => {
  const session: Session = c.get("session");
  if (session.get("user")) {
    return next();
  }
  return c.redirect("/auth");
};

export { loginHandler, isAuthenticated, callbackHandler };