import type { ContactPayload, ContactRequest } from "~/assets/api/types/contact";
import { resolveLocale } from "./locale";

export const contact = {
  async send(payload: ContactPayload): Promise<void> {
    const request: ContactRequest = {
      name: payload.name,
      contact: payload.contact,
      message: payload.message,
      locale: resolveLocale(),
    };
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`contact: ${response.status}`);
  },
};
