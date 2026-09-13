import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ServicesFinalCtaVisual } from "@/components/services/ServicesFinalCtaVisual";

const copy = {
  eyebrow: "Ready When You Are",
  title: ["Not Sure What You Need?", "Let’s Find the Right Solution Together."],
  description:
    "Tell us what you want to build, improve or solve. Flash One can help define the right technology direction and the next step.",
  primaryCta: "Start a Project",
  secondaryCta: "Talk to Our Team",
} as const;

export function ServicesFinalCta() {
  return (
    <section
      id="ready"
      className="relative overflow-hidden bg-page pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgb(11_125_255/0.12),transparent_36%),radial-gradient(circle_at_18%_72%,rgb(1_208_252/0.1),transparent_32%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,22rem)] lg:gap-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,24rem)]">
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
          </div>

          <ServicesFinalCtaVisual />
        </div>
      </Container>
    </section>
  );
}
