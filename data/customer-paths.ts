export const customerPathsCopy = {
  eyebrow: "Built Around You",
  title: ["Different Needs.", "One Technology Partner."],
  description:
    "Whether you are starting with an idea, improving an existing system, building for a business, or looking for long-term technology support, Flash One adapts the solution around what you actually need.",
} as const;

export const customerPaths = [
  {
    id: "idea",
    number: "01",
    statement: "I have an idea",
    title: ["Turn an Idea", "Into Something Real"],
    description:
      "Bring us the concept. We help shape the technology, define the right direction and turn it into a practical digital product.",
    labels: ["Idea Validation", "Product Planning", "Design & Development"],
    cta: "Build My Idea",
    align: "start",
  },
  {
    id: "built",
    number: "02",
    statement: "I need something built",
    title: ["From Requirement", "to Working Solution"],
    description:
      "For clients who already know what they need, Flash One can design and build the software, application, platform or digital system around clear requirements.",
    labels: ["Web Systems", "Applications", "Custom Software"],
    cta: "Start My Project",
    align: "end",
  },
  {
    id: "business",
    number: "03",
    statement: "I run a business",
    title: ["Technology for", "How Your Business Works"],
    description:
      "We help businesses improve operations with custom systems, automation, integrations and practical technology solutions.",
    labels: ["Business Systems", "Automation", "Digital Transformation"],
    cta: "Explore Business Solutions",
    align: "start",
  },
  {
    id: "support",
    number: "04",
    statement: "I need ongoing support",
    title: ["Technology That", "Keeps Evolving With You"],
    description:
      "Flash One can support, improve and extend existing digital systems as your requirements change.",
    labels: ["Technical Support", "System Improvement", "Ongoing Development"],
    cta: "Get Technology Support",
    align: "end",
  },
] as const;
