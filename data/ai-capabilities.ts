export const aiCapabilitiesCopy = {
  eyebrow: "Practical Intelligence",
  title: ["AI That Helps", "Work Move Forward."],
  description:
    "Flash One uses artificial intelligence to help people understand information, complete work more efficiently and make digital systems easier to use.",
} as const;

export const aiCapabilities = [
  {
    number: "01",
    name: "Understand",
    eyebrow: "Understand Information",
    title: ["Turn Information", "Into Something Clear."],
    description:
      "AI can help organize, summarize and interpret information so people can find what matters without working through everything manually.",
    examples: ["Documents", "Messages", "Reports", "Business Data"],
    outcome: "From information overload to clarity.",
    icon: "understand",
    zone: "entry",
  },
  {
    number: "02",
    name: "Assist",
    eyebrow: "Assist People",
    title: ["Useful Help", "Inside the Work."],
    description:
      "Intelligence can support people while they work by helping with questions, information, preparation and everyday digital tasks.",
    examples: [
      "Information Assistance",
      "Content Support",
      "Task Guidance",
      "Knowledge Access",
    ],
    outcome: "Help when and where it is needed.",
    icon: "assist",
    zone: "use",
  },
  {
    number: "03",
    name: "Automate",
    eyebrow: "Automate Work",
    title: ["Reduce Repetition.", "Keep Work Moving."],
    description:
      "AI can support automation where repetitive information handling or routine digital work would otherwise consume valuable time.",
    examples: [
      "Data Processing",
      "Task Routing",
      "Document Handling",
      "Routine Workflows",
    ],
    outcome: "Less repetitive work. More useful time.",
    icon: "automate",
    zone: "use",
  },
  {
    number: "04",
    name: "Connect",
    eyebrow: "Connect Knowledge",
    title: ["Bring Information", "Closer Together."],
    description:
      "Intelligence can help make information from different parts of a digital environment easier to access and use in the right context.",
    examples: [
      "Business Knowledge",
      "System Information",
      "Documents",
      "Internal Resources",
    ],
    outcome: "The right information in the right context.",
    icon: "connect",
    zone: "widen",
  },
  {
    number: "05",
    name: "Improve",
    eyebrow: "Improve Decisions",
    title: ["See More Clearly", "Before the Next Step."],
    description:
      "AI can help surface patterns, summaries and useful context that support people in making better-informed decisions.",
    examples: ["Insights", "Patterns", "Summaries", "Operational Context"],
    outcome: "Better context for human decisions.",
    icon: "improve",
    zone: "outcome",
  },
] as const;

export type AICapabilityIcon = (typeof aiCapabilities)[number]["icon"];
