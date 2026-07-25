export type Project = {
  title: string;
  url: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  description: string;
  highlights: readonly string[];
};

/**
 * Neue Referenzen werden hier ergänzt. Der Coverflow liest die Liste direkt,
 * deshalb sind keine Änderungen an der Darstellung notwendig.
 */
export const projects: readonly Project[] = [
  {
    title: "Mitgefeiert",
    url: "https://mitgefeiert.de",
    desktopImage: "/projects/mitgefeiert-desktop.webp",
    mobileImage: "/projects/mitgefeiert-mobile.webp",
    alt: "Startseite von Mitgefeiert mit Feierplanung auf Desktop und Smartphone",
    description:
      "Eine Web-App für gemeinsame Feierplanung. Aufgaben, Essen, Wünsche und Zusagen bleiben für alle an einem Ort.",
    highlights: [
      "Gemeinsame Planung ohne Gästekonto",
      "Aufgaben, Beiträge und Wünsche übersichtlich bündeln",
      "Für die Nutzung auf dem Smartphone entwickelt",
    ],
  },
  {
    title: "Einzelstück by Elisa",
    url: "https://einzelstueckbyelisa.de",
    desktopImage: "/projects/einzelstueck-by-elisa-desktop.webp",
    mobileImage: "/projects/einzelstueck-by-elisa-mobile.webp",
    alt: "Startseite von Einzelstück by Elisa auf einem Desktop-Bildschirm",
    description:
      "Ein moderner, emotionaler Webauftritt für ein lokales Unternehmen mit handgemachten Produkten und personalisierten Geschenkideen.",
    highlights: [
      "Emotionaler Markenauftritt mit klarer Nutzerführung",
      "Produktgalerien und Inhalte zur Personalisierung",
      "Optimiert für Smartphone und Desktop",
    ],
  },
];
