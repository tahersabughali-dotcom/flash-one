export const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Software Development", href: "/services#software-development" },
      { label: "Automation & AI", href: "/services#automation-ai" },
      { label: "IT Consultancy", href: "/services#it-consultancy" },
      { label: "Technology Services", href: "/services#technology-services" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Business Systems", href: "/solutions#business-systems" },
      { label: "Digital Transformation", href: "/solutions#digital-transformation" },
      { label: "Workflow Automation", href: "/solutions#workflow-automation" },
      { label: "Custom Platforms", href: "/solutions#custom-platforms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/company" },
      { label: "Our Approach", href: "/company#company-approach" },
      { label: "Global Presence", href: "/company#global-perspective" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export const footerCopy = {
  copyright: "© 2026 Flash One. All rights reserved.",
  brandLines: ["Technology", "People", "A Brighter", "Tomorrow"],
  nextLines: ["Built", "For What's", "Next"],
} as const;
