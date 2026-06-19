import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoTrack — AI-Powered Carbon Footprint Tracker",
  description: "Monitor, understand, and reduce your daily carbon footprint with personalized AI insights, gamification streaks, and detailed emission calculators.",
  keywords: ["carbon footprint", "sustainability", "eco tracker", "CO2", "climate", "green living"],
  authors: [{ name: "EcoTrack" }],
  openGraph: {
    title: "EcoTrack — AI-Powered Carbon Footprint Tracker",
    description: "Track and reduce your carbon footprint with AI-powered insights and gamification.",
    type: "website",
    locale: "en_US",
  },
  metadataBase: new URL("https://5txxs49x.insforge.site"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-bold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
