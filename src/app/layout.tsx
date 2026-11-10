import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeSync } from "@/components/ThemeSync";
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

/**
 * Runs before first paint so the palette matches the device clock immediately.
 * 06:00–18:00 local time is day mode, everything else is night mode. ThemeSync
 * keeps it current while the app stays open.
 */
const themeBootstrapScript = `(function(){try{var h=new Date().getHours();var day=h>=6&&h<18;var c=document.documentElement.classList;c.toggle("day",day);c.toggle("dark",!day);document.documentElement.style.colorScheme=day?"light":"dark";var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",day?"#f7f5ef":"#09090b");}}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[#f7f5ef] dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col selection:bg-amber-500 selection:text-zinc-950">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {children}
        <ThemeSync />
        <Analytics />
      </body>
    </html>
  );
}
