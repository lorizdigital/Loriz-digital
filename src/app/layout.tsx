import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CursorFollower } from "@/components/CursorFollower";
import { MotionDebugPanel } from "@/components/MotionDebugPanel";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
    template: "%s | Loriz Digital",
  },
  authors: [{ name: "Lino Loriz" }],
  creator: "Lino Loriz",
  icons: {
    icon: [
      { url: "/icons/loriz-app-icon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/icons/loriz-app-icon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Script id="mobile-reload-scroll-reset" strategy="beforeInteractive">
          {`(() => {
            const navigation = performance.getEntriesByType("navigation")[0];
            const isMobile = window.matchMedia("(max-width: 767px)").matches;
            const canControlRestoration = "scrollRestoration" in history;

            if (navigation?.type !== "reload" || !isMobile) {
              if (canControlRestoration) history.scrollRestoration = "auto";
              return;
            }

            if (canControlRestoration) history.scrollRestoration = "manual";

            window.scrollTo({ top: 0, left: 0, behavior: "auto" });

            window.addEventListener("pagehide", () => {
              if (canControlRestoration) history.scrollRestoration = "auto";
            }, { once: true });
          })();`}
        </Script>
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-glass-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-clay/45 focus:ring-offset-2 focus:ring-offset-background"
        >
          Zum Inhalt
        </a>
        {children}
        <ScrollToTop />
        <CursorFollower />
        <MotionDebugPanel />
      </body>
    </html>
  );
}
