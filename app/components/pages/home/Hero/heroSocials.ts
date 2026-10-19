import { SOCIAL_NETWORKS } from "~/assets/const";

export const socials = SOCIAL_NETWORKS.map((social) => ({
  key: social.key,
  label: social.label,
  href: social.href,
  class: `home-hero-social-${social.key}`,
}));
