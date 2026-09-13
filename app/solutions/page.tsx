import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { CoreSolutions } from "@/components/solutions/CoreSolutions";
import { SolutionPaths } from "@/components/solutions/SolutionPaths";
import { HowWeSolve } from "@/components/solutions/HowWeSolve";
import { SolutionPrinciples } from "@/components/solutions/SolutionPrinciples";
import { SolutionsFinalCTA } from "@/components/solutions/SolutionsFinalCTA";

export const metadata: Metadata = {
  title: "Solutions | Flash One",
  description:
    "From improving everyday operations to building connected digital experiences, Flash One creates technology solutions around the way people and businesses actually work.",
};

export default function SolutionsPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <SolutionsHero />
        <CoreSolutions />
        <SolutionPaths />
        <HowWeSolve />
        <SolutionPrinciples />
        <SolutionsFinalCTA />
      </main>
      <PublicFooter />
    </>
  );
}
