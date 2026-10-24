import type { ContactPayload } from "~/assets/api/types/contact";

const SUBMIT_DELAY = 900;

export const contact = {
  async submit(payload: ContactPayload): Promise<void> {
    void payload;
    await new Promise<void>((resolve) => setTimeout(resolve, SUBMIT_DELAY));
  },
};
