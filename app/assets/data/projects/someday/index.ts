import type { ProjectDefinition } from "../../../api/types/catalog";

const project = {
  id: "someday",
  name: "Someday",
  tone: "accent",
  url: null,
  preview: "someday/media/preview.webp",
  previewFrame: "terminal",
  tags: [],
  stack: [],
  caseStack: [
    { label: "C++", own: true },
    { label: "Arduino", own: true },
    { label: "ESP32", own: true },
    { label: "FreeRTOS", own: true },
    { label: "PlatformIO", own: true },
    { label: "MFRC522", own: true },
    { label: "PN532", own: true },
    { label: "NDEF", own: true },
    { label: "TinyGPSPlus", own: true },
    { label: "ArduinoJson", own: true },
    { label: "FastLED", own: true },
    { label: "U8g2", own: true },
    { label: "OneButton", own: true },
  ],
  isFavorite: false,
  text: {
    ru: {
      subtitle: "БИБЛИОТЕКИ ДРАЙВЕРОВ · ЭЛЕКТРОНИКА ДЛЯ РОЛЕВОЙ ИГРЫ",
      headline: "11 библиотек драйверов, на которых устройства отработали на игре 2026 года",
      description:
        "Библиотеки драйверов на C++ для ESP32, из которых собираются игровые устройства для полигонной ролевой игры по S.T.A.L.K.E.R. на Урале.",
      previewAlt:
        "Иллюстрация: ретро-монитор со схемой платы ESP32 Someday и подключённых к ней модулей",
      role: "Весь софт в команде KB Someday из трёх человек. В этом кейсе — автор 11 библиотек драйверов someday-* на C++ под ESP32 и FreeRTOS.",
      result:
        "Устройства на этих библиотеках отработали на игре 2026 года: около 30 игроков прошли квесты локации, а устройство живёт 18–20 часов от двух аккумуляторов 18650 без оптимизаций энергопотребления.",
    },
    en: {
      subtitle: "DRIVER LIBRARIES · ELECTRONICS FOR A ROLE-PLAYING GAME",
      headline: "11 driver libraries that powered the devices at the 2026 game",
      description:
        "C++ driver libraries for ESP32 that game devices are built from, for a S.T.A.L.K.E.R. field role-playing game in the Urals.",
      previewAlt:
        "Illustration: a retro CRT monitor showing a diagram of the Someday ESP32 board and its wired modules",
      role: "All the software in the three-person KB Someday team. In this case, the author of 11 someday-* driver libraries in C++ for ESP32 and FreeRTOS.",
      result:
        "Devices built on these libraries worked through the 2026 game: about 30 players went through the location's quests, and a device runs 18–20 hours on two 18650 batteries with no power optimizations.",
    },
  },
} satisfies ProjectDefinition;

export default project;
