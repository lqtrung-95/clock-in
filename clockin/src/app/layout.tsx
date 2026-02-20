import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://clockin.app";
const APP_NAME = "Clockin";
const APP_DESCRIPTION =
  "A gamified focus tracker with Pomodoro timers, ambient video scenes, streaks, social leaderboards, and dream goal tracking. Stay in flow, every day.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  // Title
  title: {
    default: `${APP_NAME} — Focus & Flow`,
    template: `%s | ${APP_NAME}`,
  },

  // Description & keywords
  description: APP_DESCRIPTION,
  keywords: [
    "pomodoro timer",
    "focus app",
    "time tracker",
    "productivity",
    "study timer",
    "ambient music",
    "deep work",
    "flow state",
    "streaks",
    "gamification",
    "goal tracker",
    "focus room",
  ],

  // Canonical
  alternates: { canonical: "/" },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // Favicon / icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  // PWA manifest
  manifest: "/manifest.json",

  // Apple PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },

  // Open Graph
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Focus & Flow`,
    description: APP_DESCRIPTION,
    locale: "en_US",
  },

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Focus & Flow`,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060614" },
    { media: "(prefers-color-scheme: light)", color: "#060614" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
