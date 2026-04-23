import { redirect } from "next/navigation";

export default function Home() {
  // For now, redirect to login by default.
  // Later this can check for an auth cookie and redirect to /feed or /login.
  redirect("/login");
}
