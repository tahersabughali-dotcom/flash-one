export const contactInfoCopy = {
  eyebrow: "Contact & Company",
  title: ["The Right Place", "to Start the Conversation."],
} as const;

export const contactInfoItems = [
  {
    label: "Website",
    value: "www.flashone.uk",
    href: "https://www.flashone.uk",
    verified: true,
  },
  {
    label: "General Contact",
    value: "Contact email will be available here.",
    href: null,
    verified: false,
  },
  {
    label: "Project Conversations",
    value:
      "Start with an idea, something to improve, or a question about direction.",
    href: "#start-conversation",
    verified: false,
  },
  {
    label: "Support Direction",
    value:
      "The conversation begins on this page. Dedicated support channels will be added when they are ready.",
    href: null,
    verified: false,
  },
] as const;
