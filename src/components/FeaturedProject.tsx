import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProjectCoverflow } from "@/components/ProjectCoverflow";
import { projects } from "@/data/projects";

export function FeaturedProject() {
  return (
    <section id="projekte" className="section-padding">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Ausgewählte Projekte</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="balance mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Webseiten und digitale Produkte, die im Alltag funktionieren.
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ProjectCoverflow projects={projects} />
        </Reveal>
      </Container>
    </section>
  );
}
