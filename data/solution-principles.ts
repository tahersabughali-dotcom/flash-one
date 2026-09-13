export const solutionPrinciplesCopy = {
  eyebrow: "Built for Real Growth",
  title: ["Built to Fit.", "Ready to Grow."],
  description:
    "The right technology should work for today without limiting tomorrow. Flash One designs solutions that fit the way you operate, connect what matters, scale with your needs and adapt as your business evolves.",
} as const;

export const solutionPrinciples = [
  {
    number: "01",
    name: "Custom",
    title: ["Designed Around", "How You Work"],
    description:
      "Every business has different workflows, users and priorities. The solution should fit the real operating model instead of forcing the business into a generic system.",
    label: "Built Around You",
    icon: "custom",
    corner: "start",
  },
  {
    number: "02",
    name: "Connected",
    title: ["Made to Work", "Together"],
    description:
      "Modern technology should not create more isolated tools. Where needed, systems, information and workflows can be connected into one clearer digital environment.",
    label: "One Connected Environment",
    icon: "connected",
    corner: "end",
  },
  {
    number: "03",
    name: "Scalable",
    title: ["Ready for", "What Comes Next"],
    description:
      "The solution should be able to support more users, more processes and more capability as the organization grows.",
    label: "Designed for Growth",
    icon: "scalable",
    corner: "start",
  },
  {
    number: "04",
    name: "Adaptable",
    title: ["Built to", "Keep Evolving"],
    description:
      "Needs change over time. A well-designed digital solution should be structured so it can be improved, extended and adjusted without rebuilding everything from the beginning.",
    label: "Made to Evolve",
    icon: "adaptable",
    corner: "end",
  },
] as const;

export type PrincipleIcon = (typeof solutionPrinciples)[number]["icon"];
