import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LorizMark } from "@/components/icons/LorizMark";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-muted/60">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LorizMark className="h-5 w-5 shrink-0 text-foreground" />
              <span className="text-[1.05rem] font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-muted-foreground">
              {siteConfig.slogan}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Navigation</h3>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Kontakt</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Rechtliches</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
          © {year} {siteConfig.name}. Alle Rechte vorbehalten.
        </div>
      </Container>
    </footer>
  );
}
