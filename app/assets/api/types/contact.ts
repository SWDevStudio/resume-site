import type { Locale } from "../../const/locale";

export interface ContactPayload {
  name: string;
  contact: string;
  message: string;
  consent: true;
}

export interface ContactRequest {
  name: string;
  contact: string;
  message: string;
  locale: Locale;
}
