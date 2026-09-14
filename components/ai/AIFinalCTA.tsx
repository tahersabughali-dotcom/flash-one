import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { AIFinalCTAVisual } from "@/components/ai/AIFinalCTAVisual";

const copy = {
  eyebrow: "Ready to Explore AI?",
  title: ["Bring Intelligence", "Into the Work That Matters."],
  description:
    "Tell us what you want to understand, improve or simplify. Flash One can help explore where AI could add practical value and shape the right next step.",
  primaryCta: "Explore an AI Project",
  secondaryCta: "Talk to Our Team",
  note: "Start with the need. We’ll explore where intelligence fits.",
} as const;

export function AIFinalCTA() {
  return (
    <section
      id="ai-cta"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_46%,rgb(11_125_255/0.13),transparent_34%),radial-gradient(circle_at_22%_70%,rgb(1_208_252/0.1),transparent_28%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,26rem)] lg:gap-10 xl:gap-14">
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
              <Button href="/contact#start-conversation" arrow>
                {copy.primaryCta}
              </Button>
              <Button href="/contact#start-conversation" variant="secondary" arrow>
                {copy.secondaryCta}
              </Button>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-navy/45">
              {copy.note}
            </p>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <AIFinalCTAVisual compact />
          </div>
          <div
            className="mx-auto hidden w-full max-w-[20rem] md:block lg:max-w-none"
            aria-hidden="true"
          >
            <AIFinalCTAVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
