import { redirect } from "next/navigation";

export default async function HomePage() {
  // Always redirect to dashboard - guest mode is supported
  redirect("/dashboard");
}
