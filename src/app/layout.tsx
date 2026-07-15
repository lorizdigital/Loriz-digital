import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CursorFollower } from "@/components/CursorFollower";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = siteConfig.url;

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  image: `${siteUrl}/opengraph-image`,
  url: siteUrl,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  founder: { "@type": "Person", name: siteConfig.founder },
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    postalCode: siteConfig.address.postalCode,
    addressLocality: siteConfig.address.city,
    addressCountry: siteConfig.address.countryCode,
  },
  description:
    "Moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
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
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-glass-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-clay/45 focus:ring-offset-2 focus:ring-offset-background"
        >
          Zum Inhalt
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
        <ScrollToTop />
        <CursorFollower />
      </body>
    </html>
  );
}
