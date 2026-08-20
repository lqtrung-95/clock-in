import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-solid text-accent-fg">
            <Flame className="h-7 w-7 fill-current" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
            <p className="text-muted-foreground">
              Start tracking your effort and building streaks
            </p>
          </div>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-solid hover:opacity-80 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
