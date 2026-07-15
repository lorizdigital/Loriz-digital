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

const description =
  "Loriz Digital entwickelt moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige. Persönlich betreut von Lino Loriz.";

const socialDescription =
  "Moderne Webseiten und digitale Lösungen für kleine Unternehmen, Handwerksbetriebe und Selbstständige – persönlich entwickelt von Lino Loriz.";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  image: `${siteConfig.url}/social/loriz-digital-light.png`,
  logo: `${siteConfig.url}/icons/loriz-app-icon-light.svg`,
  url: siteConfig.url,
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
  title: { absolute: "Loriz Digital – Digitale Lösungen für Ihr Unternehmen" },
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
    images: ["/social/loriz-digital-light.png"],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
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
