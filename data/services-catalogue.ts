export const servicesCatalogueCopy = {
  eyebrow: "What We Do",
  title: ["Technology Solutions", "Built for Real Needs"],
  description:
    "From an initial idea to a complete digital system, Flash One provides technology services designed around real business and individual requirements.",
} as const;

export const catalogueServices = [
  {
    id: "software-development",
    number: "01",
    label: "Software Development",
    title: ["Software Built", "Around Your Needs"],
    description:
      "We design and develop reliable digital products from the ground up, with a focus on usability, performance and long-term scalability.",
    capabilities: [
      "Web Applications",
      "Business Systems",
      "Custom Software",
      "Digital Platforms",
      "Application Development",
      "System Modernization",
    ],
    cta: "Explore Software Development",
    visual: "software",
    reversed: false,
  },
  {
    id: "automation-ai",
    number: "02",
    label: "Automation & AI",
    title: ["Smarter Workflows.", "Better Results."],
    description:
      "We combine automation and applied artificial intelligence to simplify workflows, improve productivity and turn repetitive processes into efficient digital systems.",
    capabilities: [
      "Workflow Automation",
      "AI-Powered Tools",
      "Intelligent Assistants",
      "Process Automation",
      "Data-Driven Workflows",
      "Custom AI Solutions",
    ],
    cta: "Explore Automation & AI",
    visual: "automation",
    reversed: true,
  },
  {
    id: "it-consultancy",
    number: "03",
    label: "IT Consultancy",
    title: ["Technology Decisions", "With Clear Direction"],
    description:
      "We help businesses understand, plan and improve their technology through practical consulting focused on real operational needs.",
    capabilities: [
      "Technology Strategy",
      "System Planning",
      "Digital Transformation",
      "Technical Assessment",
      "Solution Architecture",
      "Technology Advisory",
    ],
    cta: "Explore IT Consultancy",
    visual: "consultancy",
    reversed: false,
  },
  {
    id: "technology-services",
    number: "04",
    label: "Technology Services",
    title: ["Technology That", "Keeps Moving"],
    description:
      "From implementation and system setup to ongoing technical support, we help keep digital operations reliable, secure and ready to evolve.",
    capabilities: [
      "System Implementation",
      "Technical Support",
      "System Setup",
      "Digital Information Services",
      "Integration Support",
      "Technology Optimization",
    ],
    cta: "Explore Technology Services",
    visual: "services",
    reversed: true,
  },
] as const;

export type CatalogueVisual = (typeof catalogueServices)[number]["visual"];
