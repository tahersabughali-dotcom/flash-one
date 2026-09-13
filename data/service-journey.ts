export const serviceJourneyCopy = {
  eyebrow: "From Idea to Delivery",
  title: ["A Clear Path", "From Start to Solution"],
  description:
    "Every project is different, but the journey should always be clear. Flash One moves from understanding the requirement to building, delivering and improving the right technology solution.",
} as const;

export const journeyStages = [
  {
    number: "01",
    title: "Understand",
    description:
      "We start with your idea, requirement, challenge or existing system.",
    label: "Needs & Goals",
    icon: "understand",
    side: "left",
  },
  {
    number: "02",
    title: "Define",
    description:
      "We shape the scope, priorities and right technology direction.",
    label: "Scope & Direction",
    icon: "define",
    side: "right",
  },
  {
    number: "03",
    title: "Design",
    description:
      "We structure the experience, system and technical solution before development.",
    label: "Experience & Architecture",
    icon: "design",
    side: "left",
  },
  {
    number: "04",
    title: "Build",
    description:
      "We develop and implement the solution in clear, manageable stages.",
    label: "Development & Implementation",
    icon: "build",
    side: "right",
  },
  {
    number: "05",
    title: "Deliver",
    description:
      "We review, test and prepare the completed solution for real use.",
    label: "Testing & Launch",
    icon: "deliver",
    side: "left",
  },
  {
    number: "06",
    title: "Evolve",
    description:
      "After delivery, the technology can continue to improve as your needs change.",
    label: "Support & Improvement",
    icon: "evolve",
    side: "right",
  },
] as const;

export type JourneyIcon = (typeof journeyStages)[number]["icon"];
