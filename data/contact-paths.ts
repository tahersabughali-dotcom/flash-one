export const contactPathsCopy = {
  eyebrow: "Start a Conversation",
  title: ["What Would You", "Like to Talk About?"],
  description:
    "Choose the option closest to what you need. You can start even if the details are not complete yet.",
  center: "Start Here",
} as const;

export const contactPaths = [
  {
    number: "01",
    name: "New Project",
    title: ["I Have Something", "I Want to Build."],
    description:
      "Start with an idea for software, a digital platform, an application or another technology solution.",
    label: "New Project",
  },
  {
    number: "02",
    name: "Improve Something",
    title: ["I Want to Improve", "What I Already Have."],
    description:
      "Discuss an existing website, application, system, workflow or digital setup that needs improvement.",
    label: "Improve Existing",
  },
  {
    number: "03",
    name: "Automation / AI",
    title: ["I Want to Make", "Work Smarter."],
    description:
      "Explore where automation or artificial intelligence could simplify repetitive work, information or processes.",
    label: "Automation & AI",
  },
  {
    number: "04",
    name: "Not Sure Yet",
    title: ["I Know the Problem.", "Not the Technology."],
    description:
      "Tell us what is not working or what you want to achieve. You do not need to choose the technical solution yourself.",
    label: "Help Me Find the Direction",
  },
] as const;
