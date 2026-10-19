export interface HeroSocial {
  key: string;
  label: string;
  href: string;
  class: string;
}

export const socials: HeroSocial[] = [
  {
    key: "telegram",
    label: "Telegram",
    href: "https://t.me",
    class: "home-hero-social-telegram",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    class: "home-hero-social-linkedin",
  },
  {
    key: "github",
    label: "GitHub",
    href: "https://github.com",
    class: "home-hero-social-github",
  },
];
