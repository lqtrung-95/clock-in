import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-[#060614]/80">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Clockin</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-sm text-white/60 hover:text-white transition-colors font-medium px-4 py-2"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
        >
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}
