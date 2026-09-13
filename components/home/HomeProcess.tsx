import { processCopy, processSteps } from "@/data/process";
import { Container } from "@/components/layout/Container";
import { ProcessStep } from "@/components/home/ProcessStep";

export function HomeProcess() {
  return (
    <section id="process" className="relative bg-page pt-10 pb-16 sm:pt-12 sm:pb-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {processCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.95] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            {processCopy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            {processCopy.description}
          </p>
        </div>

        <ol className="relative mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 xl:grid-cols-5">
          <span
            className="absolute top-[3.5rem] right-[10%] left-[10%] hidden h-px bg-line xl:block"
            aria-hidden="true"
          />
          {processSteps.map((step, index) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isLast={index === processSteps.length - 1}
            />
          ))}
        </ol>
      </Container>
    </section>
  );
}
