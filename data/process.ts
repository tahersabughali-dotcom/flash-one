export const processCopy = {
  eyebrow: "How We Work",
  title: "A Simple, Clear Process",
  description:
    "From the first idea to final delivery, we keep the process transparent, collaborative and efficient.",
} as const;

export const processSteps = [
  {
    number: "01",
    title: "Discover",
    description: "We understand your needs",
    icon: "discover",
  },
  {
    number: "02",
    title: "Plan",
    description: "We design the right solution",
    icon: "plan",
  },
  {
    number: "03",
    title: "Build",
    description: "We develop and implement",
    icon: "build",
  },
  {
    number: "04",
    title: "Deliver",
    description: "We test and launch",
    icon: "deliver",
  },
  {
    number: "05",
    title: "Support",
    description: "We stay with you after delivery",
    icon: "support",
  },
] as const;

export type ProcessIcon = (typeof processSteps)[number]["icon"];
