import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = "https://www.lorizdigital.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
    template: "%s | Loriz Digital",
  },
  description:
    "Loriz Digital entwickelt moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige. Persönlich betreut von Lino Loriz.",
  keywords: [
    "Webdesign",
    "Webseite erstellen lassen",
    "digitale Lösungen",
    "Handwerker Webseite",
    "Loriz Digital",
  ],
  authors: [{ name: "Lino Loriz" }],
  creator: "Lino Loriz",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "Loriz Digital",
    title: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
    description:
      "Moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige – persönlich entwickelt von Lino Loriz.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  );
}
