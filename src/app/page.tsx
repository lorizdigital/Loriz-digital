import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProblemSolution } from "@/components/ProblemSolution";
import { Services } from "@/components/Services";
import { FeaturedProject } from "@/components/FeaturedProject";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site";

const title = "Webseiten für Handwerk & kleine Unternehmen in Kassel | Loriz Digital";

const description =
  "Moderne Webseiten und digitale Lösungen für Handwerksbetriebe, kleine Unternehmen und Selbstständige in Kassel und Umgebung. Persönlich betreut von Lino Loriz aus Calden.";

const socialDescription =
  "Moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige – persönlich entwickelt von Lino Loriz.";

const websiteJsonLd = {
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: `${siteConfig.url}/`,
  inLanguage: "de-DE",
  publisher: { "@id": `${siteConfig.url}/#business` },
};

const localBusinessJsonLd = {
  "@type": "ProfessionalService",
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  image: `${siteConfig.url}/social/loriz-digital-light.png`,
  logo: `${siteConfig.url}/icons/loriz-app-icon-light.svg`,
  url: siteConfig.url,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  vatID: siteConfig.vatId,
  founder: { "@type": "Person", name: siteConfig.founder },
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    postalCode: siteConfig.address.postalCode,
    addressLocality: siteConfig.address.city,
    addressCountry: siteConfig.address.countryCode,
  },
  areaServed: [
    { "@type": "City", name: "Kassel" },
    { "@type": "AdministrativeArea", name: "Landkreis Kassel" },
  ],
  description:
    "Moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [websiteJsonLd, localBusinessJsonLd],
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  keywords: [
    "Webdesign",
    "Webseite erstellen lassen",
    "digitale Lösungen",
    "Handwerker Webseite",
    "Loriz Digital",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
    description: socialDescription,
    images: [
      {
        url: "/social/loriz-digital-light.png",
        width: 1200,
        height: 630,
        alt: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
    description: socialDescription,
    images: [
      {
        url: "/social/loriz-digital-light.png",
        alt: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function Home() {
  return (
    <>
      <Navigation heroLogoDockEnabled />
      <main id="main-content" className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Hero />
        <ProblemSolution />
        <Services />
        <FeaturedProject />
        <Process />
        <About />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
