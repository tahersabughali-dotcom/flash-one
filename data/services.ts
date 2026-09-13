export const servicesIntro = {
  eyebrow: "Our Services",
  title: "Complete Technology Solutions",
  description:
    "From custom software to intelligent automation — we turn ambitious ideas into real-world solutions.",
  action: "View All Services",
} as const;

export const services = [
  {
    id: "software-development",
    number: "01",
    title: "Software Development",
    description:
      "Scalable, secure and high-performance applications for the future.",
    visual: "cube",
  },
  {
    id: "automation-ai",
    number: "02",
    title: "Automation & AI",
    description:
      "Intelligent workflows and applied AI designed for measurable impact.",
    visual: "orb",
  },
  {
    id: "it-consultancy",
    number: "03",
    title: "IT Consultancy",
    description:
      "Strategic technology consulting to modernize and grow your business.",
    visual: "blocks",
  },
  {
    id: "technology-services",
    number: "04",
    title: "Technology Services",
    description:
      "Reliable technical services to keep your systems secure, optimized and running smoothly.",
    visual: "platform",
  },
] as const;

export type ServiceVisualType = (typeof services)[number]["visual"];
