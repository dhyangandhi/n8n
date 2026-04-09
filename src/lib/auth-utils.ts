import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// ✅ Only allow logged-in users
export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  return session;
};

// ✅ Block logged-in users from login/signup
export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session.user && session.user.id) {
    redirect("/dashboard");
  }

  return null;
};