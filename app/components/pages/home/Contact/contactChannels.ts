import { CONTACT_CHANNELS } from "~/assets/const";

export const channels = CONTACT_CHANNELS.map((channel) => ({
  key: channel.key,
  href: channel.href,
  value: channel.value,
  attrs: channel.key === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" },
}));
