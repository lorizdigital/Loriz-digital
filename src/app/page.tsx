import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ProblemSolution } from "@/components/ProblemSolution";
import { Services } from "@/components/Services";
import { FeaturedProject } from "@/components/FeaturedProject";
import { Process } from "@/components/Process";
import { About } from "@/components/About";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation heroLogoDockEnabled />
      <main className="flex-1">
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
