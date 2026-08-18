import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url },
    { url: `${siteConfig.url}/impressum` },
    { url: `${siteConfig.url}/datenschutz` },
  ];
}
