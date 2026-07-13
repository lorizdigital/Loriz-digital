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

const siteUrl = "https://loriz.digital";

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
    streetAddress: "Wiesenweg 23",
    postalCode: "34379",
    addressLocality: "Calden",
    addressCountry: "DE",
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
