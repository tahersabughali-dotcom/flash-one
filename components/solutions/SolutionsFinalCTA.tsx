import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SolutionsFinalCTAVisual } from "@/components/solutions/SolutionsFinalCTAVisual";

const copy = {
  eyebrow: "Have a Challenge in Mind?",
  title: ["Let’s Turn It Into", "a Clear Solution."],
  description:
    "Tell us what you want to improve, connect, automate or build. Flash One can help turn the challenge into a clear technology direction and a practical next step.",
  primaryCta: "Start a Project",
  secondaryCta: "Talk to Our Team",
  note: "You bring the challenge. We help shape the solution.",
} as const;

export function SolutionsFinalCTA() {
  return (
    <section
      id="solutions-cta"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,28rem)] lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
              <span className="block">{copy.title[0]}</span>
              <span className="mt-1 block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {copy.title[1]}
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              {copy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/#start-a-project" arrow>
                {copy.primaryCta}
              </Button>
              <Button href="/#contact" variant="secondary" arrow>
                {copy.secondaryCta}
              </Button>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-navy/45">
              {copy.note}
            </p>
          </div>

          <SolutionsFinalCTAVisual />
        </div>
      </Container>
    </section>
  );
}
