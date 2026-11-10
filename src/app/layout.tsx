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
 * Runs before first paint so the palette is right immediately: a saved manual
 * choice (day/night) wins, otherwise 06:00–18:00 local time is day mode and
 * everything else is night mode. The saved accent colour is applied here too so
 * the first paint is already tinted. ThemeSync keeps both current while the app
 * stays open. Keep these keys in sync with THEME_STORAGE_KEY in ThemeSync.tsx
 * and ACCENT_STORAGE_KEY in src/lib/accent.ts.
 */
const themeBootstrapScript = `(function(){try{var p=null;try{p=window.localStorage.getItem("dokanman-theme");}catch(e){}var h=new Date().getHours();var day=p==="day"||(p!=="night"&&h>=6&&h<18);var c=document.documentElement.classList;c.toggle("day",day);c.toggle("dark",!day);document.documentElement.style.colorScheme=day?"light":"dark";var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",day?"#f7f5ef":"#09090b");}var a="amber";try{var s=window.localStorage.getItem("dokanman-accent");if(s&&["amber","sky","indigo","violet","fuchsia"].indexOf(s)>-1){a=s;}}catch(e){}document.documentElement.dataset.accent=a;}catch(e){document.documentElement.classList.add("dark");}})();`;

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
