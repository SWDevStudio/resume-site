import type ru from "~/locales/ru.json";

type MessageSchema = typeof ru;

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends MessageSchema {}
}
