export const aiHumanControlCopy = {
  eyebrow: "Human + AI",
  title: ["Intelligence With", "Human Control."],
  description:
    "The most useful AI does not remove people from the process. It helps them understand more, work faster and make better-informed decisions while responsibility stays with the people using the system.",
} as const;

export const aiHumanControlPrinciples = [
  {
    number: "01",
    name: "Human Control",
    title: ["People Stay", "In Control."],
    description:
      "AI can assist, recommend and prepare information, but important decisions should remain with the people responsible for the work.",
    label: "Human-Led Decisions",
    prominence: "primary",
    side: "left",
  },
  {
    number: "02",
    name: "Clear Responsibility",
    title: ["Responsibility", "Stays Clear."],
    description:
      "Intelligent systems should make it clear when information is generated, suggested or assisted by AI so users understand what they are working with.",
    label: "Clear Accountability",
    prominence: "support",
    side: "left",
  },
  {
    number: "03",
    name: "Useful Assistance",
    title: ["AI Should Help,", "Not Distract."],
    description:
      "The goal is not to add AI everywhere. It should appear where it genuinely makes work clearer, faster or easier.",
    label: "Purposeful Intelligence",
    prominence: "support",
    side: "right",
  },
  {
    number: "04",
    name: "Safe Boundaries",
    title: ["Designed With", "Appropriate Limits."],
    description:
      "Different situations require different levels of automation. Flash One designs intelligent features around the sensitivity and importance of the task.",
    label: "Controlled Automation",
    prominence: "support",
    side: "right",
  },
  {
    number: "05",
    name: "Review & Oversight",
    title: ["Important Work", "Can Be Reviewed."],
    description:
      "Where appropriate, AI-supported actions and outputs can be structured so people can review, confirm or correct them before the next step.",
    label: "Review Before Action",
    prominence: "safeguard",
    side: "bottom",
  },
] as const;

export type AIHumanControlProminence =
  (typeof aiHumanControlPrinciples)[number]["prominence"];
