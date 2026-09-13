export const coreSolutionsCopy = {
  eyebrow: "Core Solutions",
  title: ["Solutions Designed", "Around Real Work"],
  description:
    "Flash One combines software, automation and technology planning to create practical solutions around how people and businesses actually operate.",
} as const;

export const coreSolutions = [
  {
    id: "business-systems",
    number: "01",
    label: "Business Systems",
    title: ["Systems That Bring", "Your Operations Together"],
    description:
      "We build connected business systems that organize information, processes and daily work into one clear digital environment.",
    outcomes: [
      "Operations",
      "Management",
      "Internal Workflows",
      "Connected Data",
      "Business Tools",
      "Custom Dashboards",
    ],
    cta: "Explore Business Systems",
    visual: "systems",
    emphasis: true,
  },
  {
    id: "digital-transformation",
    number: "02",
    label: "Digital Transformation",
    title: ["Move From Manual", "to Connected Digital Work"],
    description:
      "We help turn fragmented or outdated processes into modern digital workflows, systems and experiences.",
    outcomes: [
      "Process Modernization",
      "Digital Operations",
      "System Replacement",
      "Connected Tools",
      "Experience Improvement",
      "Technology Roadmap",
    ],
    cta: "Explore Digital Transformation",
    visual: "transformation",
    emphasis: false,
  },
  {
    id: "workflow-automation",
    number: "03",
    label: "Workflow Automation",
    title: ["Less Repetition.", "More Intelligent Flow."],
    description:
      "We automate repetitive work, connect systems and create smarter workflows that save time and reduce manual effort.",
    outcomes: [
      "Task Automation",
      "System Connections",
      "Smart Workflows",
      "AI Assistance",
      "Data Movement",
      "Process Efficiency",
    ],
    cta: "Explore Workflow Automation",
    visual: "automation",
    emphasis: false,
  },
  {
    id: "custom-platforms",
    number: "04",
    label: "Custom Platforms",
    title: ["One Platform", "Built Around Your Model"],
    description:
      "For ideas or operations that do not fit standard software, Flash One can design a custom digital platform around the exact workflow, users and requirements.",
    outcomes: [
      "Custom Architecture",
      "User Portals",
      "Business Platforms",
      "Digital Ecosystems",
      "Multi-Role Systems",
      "Scalable Foundations",
    ],
    cta: "Explore Custom Platforms",
    visual: "platforms",
    emphasis: true,
  },
] as const;

export type SolutionVisualType = (typeof coreSolutions)[number]["visual"];
