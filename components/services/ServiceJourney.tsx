import { journeyStages, serviceJourneyCopy } from "@/data/service-journey";
import { Container } from "@/components/layout/Container";
import { JourneyStage } from "@/components/services/JourneyStage";

export function ServiceJourney() {
  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-page to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {serviceJourneyCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{serviceJourneyCopy.title[0]}</span>
            <span className="block">{serviceJourneyCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted">
            {serviceJourneyCopy.description}
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-5xl overflow-hidden sm:mt-10 lg:mt-12">
          <div
            className="pointer-events-none absolute top-[4.25rem] bottom-[4.25rem] left-1/2 hidden w-[min(22rem,46%)] -translate-x-1/2 overflow-hidden lg:block"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 160 720"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <path
                d="M80 8 C 28 70, 132 150, 80 230 C 28 310, 132 390, 80 470 C 28 550, 132 640, 80 712"
                fill="none"
                stroke="url(#journeyPathGlow)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M80 8 C 28 70, 132 150, 80 230 C 28 310, 132 390, 80 470 C 28 550, 132 640, 80 712"
                fill="none"
                stroke="url(#journeyPath)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="80" cy="712" r="7" fill="#01d0fc" opacity="0.18" />
              <circle cx="80" cy="712" r="2.4" fill="#0b7dff" opacity="0.55" />
              <defs>
                <linearGradient id="journeyPath" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.5" />
                  <stop offset="78%" stopColor="#01d0fc" stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="journeyPathGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.08" />
                  <stop offset="78%" stopColor="#01d0fc" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#01d0fc" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <ol className="relative">
            {journeyStages.map((stage, index) => (
              <JourneyStage
                key={stage.number}
                stage={stage}
                isLast={index === journeyStages.length - 1}
              />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
