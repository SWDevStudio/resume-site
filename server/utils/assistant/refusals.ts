import type { AssistantLanguage, AssistantRefusalEvent, AssistantRefusalReason } from "./contract";

const refusalText: Record<AssistantLanguage, Record<AssistantRefusalReason, string>> = {
  ru: {
    limit:
      "На сегодня вопросы закончились. Напишите разработчику напрямую через форму обратной связи — обсудите проект предметно.",
    blocked:
      "Ввод закрыт до конца суток. Если хотите обсудить проект, напишите разработчику через форму обратной связи.",
    notProject:
      "Я оцениваю проекты. Опишите подробнее ваш проект: что за продукт, какие задачи, стек и команда — или дайте ссылку на него.",
    linkUnreadable:
      "Не получилось прочитать страницу по ссылке. Опишите проект словами: что за продукт, задачи, стек и команда.",
    unavailable:
      "Сейчас ассистент недоступен. Попробуйте позже или напишите разработчику через форму обратной связи.",
    invalid:
      "Не получилось разобрать сообщение. Опишите проект обычным текстом, от 150 до 2000 символов.",
    captcha: "Не удалось подтвердить, что вы не бот. Обновите страницу и попробуйте ещё раз.",
  },
  en: {
    limit:
      "You've used all of today's questions. Write to the developer directly through the contact form to discuss the project in detail.",
    blocked:
      "Input is closed until the end of the day. To discuss your project, write to the developer through the contact form.",
    notProject:
      "I assess projects. Please describe yours in more detail: the product, tasks, stack and team, or share a link to it.",
    linkUnreadable:
      "I couldn't read the page at that link. Please describe the project in words: the product, tasks, stack and team.",
    unavailable:
      "The assistant is unavailable right now. Try again later or write to the developer through the contact form.",
    invalid:
      "I couldn't process the message. Please describe the project in plain text, 150 to 2000 characters.",
    captcha: "Couldn't verify that you're not a bot. Reload the page and try again.",
  },
};

export function refusalEvent(
  reason: AssistantRefusalReason,
  language: AssistantLanguage,
  remaining: number,
): AssistantRefusalEvent {
  return { type: "refusal", reason, language, message: refusalText[language][reason], remaining };
}
