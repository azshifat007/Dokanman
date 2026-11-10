import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dokanman | দোকানম্যান - টং ও দোকান ম্যানেজমেন্ট",
  description: "মোবাইল-ফার্স্ট টং ও মুদি দোকান ডিজিটাল বাকির খাতা ও দ্রুত ক্যাশ কাউন্টার",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-white flex flex-col selection:bg-amber-500 selection:text-zinc-950">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
