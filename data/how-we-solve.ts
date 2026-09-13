export const howWeSolveCopy = {
  eyebrow: "How We Solve It",
  title: ["From Complexity", "to Clarity"],
  description:
    "Flash One starts with the real problem, maps how work actually happens, designs the right digital structure, connects what needs to work together and improves the solution over time.",
} as const;

export const solveStages = [
  {
    number: "01",
    name: "Understand",
    title: ["Start With", "the Real Problem"],
    description:
      "We first understand what is slowing you down, what is disconnected, and what outcome you actually need.",
    label: "Challenge & Goal",
    icon: "understand",
    zone: "left",
  },
  {
    number: "02",
    name: "Map",
    title: ["See How Everything", "Fits Together"],
    description:
      "We map people, processes, information and systems so the real structure behind the challenge becomes clear.",
    label: "Workflow & Relationships",
    icon: "map",
    zone: "left",
  },
  {
    number: "03",
    name: "Design",
    title: ["Shape the Right", "Digital Solution"],
    description:
      "We design the system, automation, platform or digital experience around the actual way the work should function.",
    label: "Solution Architecture",
    icon: "design",
    zone: "center",
  },
  {
    number: "04",
    name: "Connect",
    title: ["Bring the Pieces", "Into One Flow"],
    description:
      "Where needed, we connect systems, information and workflows so the solution operates as one environment.",
    label: "Systems & Integration",
    icon: "connect",
    zone: "right",
  },
  {
    number: "05",
    name: "Improve",
    title: ["Keep Making", "the Solution Better"],
    description:
      "Once the solution is in use, it can continue to evolve as requirements, users and operations change.",
    label: "Optimization & Growth",
    icon: "improve",
    zone: "right",
  },
] as const;

export type SolveIcon = (typeof solveStages)[number]["icon"];
