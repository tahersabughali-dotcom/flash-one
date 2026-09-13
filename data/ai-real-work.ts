export const aiRealWorkCopy = {
  eyebrow: "AI in Real Work",
  title: ["Intelligence Where", "Work Actually Happens."],
  description:
    "AI becomes more useful when it works inside the systems, information and workflows people already depend on. Flash One can design intelligent experiences around real operational needs.",
} as const;

export const aiRealWorkEnvironments = [
  {
    number: "01",
    name: "Documents & Knowledge",
    title: ["Make Knowledge", "Easier to Use."],
    description:
      "Help people work with documents, internal information and business knowledge without manually searching through everything.",
    examples: [
      "Document Search",
      "Knowledge Access",
      "Summaries",
      "Information Extraction",
    ],
    outcome: "Find and understand what matters faster.",
    icon: "documents",
    side: "left",
    prominence: "entry",
  },
  {
    number: "02",
    name: "Customer Support",
    title: ["Give Support Teams", "Better Context."],
    description:
      "Intelligence can help organize customer information, surface relevant knowledge and assist support teams while they handle requests.",
    examples: [
      "Support Assistance",
      "Knowledge Suggestions",
      "Request Context",
      "Response Preparation",
    ],
    outcome: "Useful assistance while people remain in control.",
    icon: "support",
    side: "right",
    prominence: "compact",
  },
  {
    number: "03",
    name: "Business Operations",
    title: ["Bring Intelligence", "Into Daily Operations."],
    description:
      "AI can support operational work by helping organize information, identify useful context and reduce repetitive digital tasks.",
    examples: [
      "Operational Assistance",
      "Information Handling",
      "Routine Processing",
      "Work Preparation",
    ],
    outcome: "More efficient everyday operations.",
    icon: "operations",
    side: "left",
    prominence: "medium",
  },
  {
    number: "04",
    name: "Data & Insights",
    title: ["Turn Business Data", "Into Clearer Context."],
    description:
      "AI can help summarize information, surface patterns and present useful context so people can understand what is happening more quickly.",
    examples: [
      "Summaries",
      "Patterns",
      "Reporting Support",
      "Operational Insights",
    ],
    outcome: "Better visibility for human decisions.",
    icon: "data",
    side: "right",
    prominence: "compact",
  },
  {
    number: "05",
    name: "Internal Workflows",
    title: ["Help Work Move", "Between People and Systems."],
    description:
      "Intelligence can support internal workflows by helping route information, prepare tasks and reduce repetitive steps between teams and systems.",
    examples: [
      "Task Preparation",
      "Information Routing",
      "Workflow Assistance",
      "Process Support",
    ],
    outcome: "Smoother movement through everyday work.",
    icon: "workflows",
    side: "left",
    prominence: "medium",
  },
  {
    number: "06",
    name: "Digital Platforms",
    title: ["Build Intelligence", "Into Digital Experiences."],
    description:
      "AI capabilities can become part of custom platforms, business systems and digital products instead of existing as a separate tool.",
    examples: [
      "Smart Search",
      "Contextual Assistance",
      "Intelligent Interfaces",
      "Embedded AI Features",
    ],
    outcome: "Intelligence becomes part of the product experience.",
    icon: "platforms",
    side: "right",
    prominence: "embed",
  },
] as const;

export type AIRealWorkIcon = (typeof aiRealWorkEnvironments)[number]["icon"];
