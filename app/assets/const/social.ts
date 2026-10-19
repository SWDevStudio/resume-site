export const SOCIAL = {
  telegram: {
    key: "telegram",
    label: "Telegram",
    value: "@kotaroSWQ",
    href: "https://t.me/kotaroSWQ",
  },
  email: {
    key: "email",
    label: "Email",
    value: "swdevstudio@gmail.com",
    href: "mailto:swdevstudio@gmail.com",
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    value: "LinkedIn",
    href: "https://www.linkedin.com/in/%D0%BC%D0%B8%D1%85%D0%B0%D0%B8%D0%BB-malakhov-3809491b1/",
  },
  github: {
    key: "github",
    label: "GitHub",
    value: "GitHub",
    href: "https://github.com/SWDevStudio",
  },
  youtube: {
    key: "youtube",
    label: "YouTube",
    value: "@swdevstudio",
    href: "https://www.youtube.com/@swdevstudio",
  },
} as const;

export type SocialKey = keyof typeof SOCIAL;

export const SOCIAL_NETWORKS = [
  SOCIAL.telegram,
  SOCIAL.linkedin,
  SOCIAL.github,
  SOCIAL.youtube,
] as const;

export const CONTACT_CHANNELS = [SOCIAL.email, SOCIAL.telegram] as const;
