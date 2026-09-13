export const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Software Development", href: "#" },
      { label: "Automation & AI", href: "#" },
      { label: "IT Consultancy", href: "#" },
      { label: "Technology Services", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Business Systems", href: "#" },
      { label: "Digital Transformation", href: "#" },
      { label: "Workflow Automation", href: "#" },
      { label: "Custom Platforms", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Our Approach", href: "#" },
      { label: "Global Presence", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Client Portal", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
] as const;

export const footerSocial = [
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "X", href: "#", icon: "x" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "Instagram", href: "#", icon: "instagram" },
] as const;

export const footerLegal = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
] as const;

export const footerCopy = {
  copyright: "© 2026 Flash One. All rights reserved.",
  brandLines: ["Technology", "People", "A Brighter", "Tomorrow"],
  nextLines: ["Built", "For What's", "Next"],
  language: "EN",
} as const;

export type FooterSocialIcon = (typeof footerSocial)[number]["icon"];
