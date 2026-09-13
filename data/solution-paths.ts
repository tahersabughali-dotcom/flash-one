export const solutionPathsCopy = {
  eyebrow: "Find Your Path",
  title: ["Start With Where", "You Are Today"],
  description:
    "You do not need to know the technical answer before you speak with Flash One. Start with the challenge, the process or the goal — we help define the right solution from there.",
} as const;

export const solutionPaths = [
  {
    id: "manual-work",
    number: "01",
    statement: "Our work is too manual",
    title: ["Too Much", "Manual Work?"],
    description:
      "If your team relies on repeated steps, spreadsheets, messages or disconnected tools, Flash One can help turn the process into a more structured digital flow.",
    directions: ["Workflow Automation", "Business Systems"],
    cta: "Improve My Workflow",
    href: "#workflow-automation",
  },
  {
    id: "disconnected-systems",
    number: "02",
    statement: "Our systems do not work together",
    title: ["Too Many", "Disconnected Systems?"],
    description:
      "If information is spread across different tools, platforms or departments, Flash One can help create a more connected operating environment.",
    directions: ["Business Systems", "Digital Transformation"],
    cta: "Connect My Systems",
    href: "#business-systems",
  },
  {
    id: "outdated-setup",
    number: "03",
    statement: "Our current setup is outdated",
    title: ["Outgrowing Your", "Current Technology?"],
    description:
      "If your existing tools or processes no longer support how you work, Flash One can help redesign the digital foundation around your current needs.",
    directions: ["Digital Transformation", "Custom Platforms"],
    cta: "Modernize My Setup",
    href: "#digital-transformation",
  },
  {
    id: "custom-need",
    number: "04",
    statement: "Nothing off the shelf fits",
    title: ["Need Something", "Truly Custom?"],
    description:
      "When standard software cannot match your workflow, users or business model, Flash One can design a custom platform around the way you actually operate.",
    directions: ["Custom Platforms", "Business Systems"],
    cta: "Build a Custom Solution",
    href: "#custom-platforms",
  },
] as const;
