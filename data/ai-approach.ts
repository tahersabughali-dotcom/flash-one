export const aiApproachCopy = {
  eyebrow: "From Idea to Intelligence",
  title: ["Start With the Need.", "Then Add Intelligence."],
  description:
    "The best AI solution starts with understanding what people are trying to achieve. Flash One identifies where intelligence can add real value, designs it around the work and shapes the experience into something practical and useful.",
  need: "Real Need",
  solution: "Useful Solution",
  lens: "Intelligence Lens",
} as const;

export const aiApproachStages = [
  {
    number: "01",
    name: "Understand",
    title: ["Start With", "the Real Need."],
    description:
      "Understand the challenge, the people involved and what a better outcome should look like.",
    label: "Need & Outcome",
    zone: "need",
  },
  {
    number: "02",
    name: "Discover",
    title: ["Find Where AI", "Can Actually Help."],
    description:
      "Identify the information, repetitive work or interactions where intelligence could create practical value.",
    label: "AI Opportunity",
    zone: "need",
  },
  {
    number: "03",
    name: "Shape",
    title: ["Design the Right", "Intelligent Experience."],
    description:
      "Define how AI should assist, what people should control and how the experience should fit naturally into the work.",
    label: "Experience Design",
    zone: "lens",
  },
  {
    number: "04",
    name: "Build",
    title: ["Bring Intelligence", "Into the System."],
    description:
      "Turn the concept into an intelligent digital experience designed around the wider platform, workflow or product.",
    label: "Intelligent Solution",
    zone: "solution",
  },
  {
    number: "05",
    name: "Evolve",
    title: ["Learn From Use.", "Keep Improving."],
    description:
      "Real use reveals what can become clearer, faster and more useful as the solution continues to evolve.",
    label: "Continuous Improvement",
    zone: "solution",
  },
] as const;
