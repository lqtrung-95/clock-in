import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Flame className="h-7 w-7 fill-current" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue tracking your effort
            </p>
          </div>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
