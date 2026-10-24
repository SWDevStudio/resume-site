import type { ProjectBlock } from "../../../api/types/projectCase";

const pochtoyProstobox = [
  {
    component: "ProjectCaseHeader",
    data: {},
  },
  {
    component: "ProjectCaseCover",
    data: {},
  },
  {
    component: "ProjectCaseMeta",
    data: {},
  },
  {
    component: "ProjectCaseFacts",
    data: {
      facts: [
        { key: "role", value: "Fullstack-разработчик" },
        { key: "team", value: "3 fullstack-разработчика и PM" },
        { key: "duration", value: "10.2023 – 01.2025" },
        { key: "status", value: "Сайты в проде" },
      ],
    },
  },
  {
    component: "ProjectCaseRole",
    data: {
      id: "role",
      name: "Что сделал я",
      items: [
        {
          title: "Скорость загрузки",
          text: "Пагинация, ленивая загрузка картинок, отдельные JS и CSS для каждой страницы вместо общего бандла и облегчённый бандл библиотек для главной Pochtoy.",
        },
        {
          title: "Фронтенд витрины",
          text: "Вёрстка по готовому дизайну на Tailwind CSS. Калькулятор доставки работает отдельным виджетом на Vue 3 внутри серверной страницы.",
        },
        {
          title: "Запросы к базе для витрины",
          text: "Отзывы со списком, пагинацией и картой, калькулятор и тарифы, баннеры главной, поиск города. Из базы выбираются только нужные поля.",
        },
        {
          title: "Кешбэк за отзыв",
          text: "Модуль на TypeScript, через который клиент получает деньги на баланс за отзыв о сервисе. Фронтенд и запросы мои.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Контекст и точка А",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "business",
            name: "Бизнес",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Pochtoy LLC доставляет покупки из американских магазинов. Посылки приходят на склад в беспошлинном Делавэре, по просьбе клиента оператор выкупает товар сам, дальше посылка уходит в Россию, Казахстан, Беларусь, на Ближний Восток или в другую страну. Сайты работают на английском, русском, арабском и испанском.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "На одной платформе у компании два бренда. Pochtoy.com работает с 2008 года. Prostobox — бюджетный бренд с доставкой от $3.99 за посылку, 79 % его отправок приходится на реселлеров и предпринимателей.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "situation",
            name: "Ситуация",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Команда вела сайты по договору поддержки: заказчик платил ежемесячно, задачи брали по ходу. Главных задач было две: чтобы сайты стабильно работали и быстрее загружались.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Замеров скорости до начала работ нет, но, по нашей оценке, местами страница грузилась дольше 5 секунд. На витрине не было пагинации, ленивой загрузки картинок и других базовых вещей.",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "process",
      name: "Процесс, архитектура и решения",
      blocks: [
        {
          component: "ProjectCaseChapter",
          data: {
            id: "architecture",
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Оба бренда работают на одном бэкенде на Laravel: общая сессия, одинаковые пути и функции в скриптах. У каждого бренда свой домен, а его стили и скрипты накладываются поверх общих.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "BRANDS",
                      title: "Два бренда",
                      text: "Pochtoy.com и Prostobox: свои стили и скрипты поверх общих.",
                      code: ["assets/guest", "assets/pochtoy", "assets/prostobox"],
                    },
                    {
                      label: "STOREFRONT",
                      title: "Витрина",
                      text: "Серверный рендер и jQuery, Vue 3 отдельными виджетами. Сборка на Laravel Mix.",
                    },
                    {
                      label: "API",
                      title: "API витрины",
                      text: "Тарифы и расчёт доставки, регион клиента, баннеры главной, поиск города.",
                      code: [
                        "/api/guest/calculator/*",
                        "/api/guest/client-region/get",
                        "/api/guest/index-banners/get",
                        "/city/search",
                      ],
                    },
                    {
                      label: "DATA",
                      title: "Данные и статика",
                      text: "PostgreSQL, Redis для кэша, статика на Bunny CDN.",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "review-cash",
            name: "Кешбэк за отзыв",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Клиент пишет отзыв о сервисе на внешней площадке и получает за него деньги на баланс. Этот модуль на TypeScript сделал я: фронтенд и запросы.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Отзыв",
                      text: "От 200 знаков, с фото и трек-номером",
                    },
                    {
                      title: "Ссылка",
                      text: "Клиент вставляет ссылку на отзыв в форму на сайте",
                    },
                    {
                      title: "Проверка",
                      text: "Отзыв проверяет оператор",
                    },
                    {
                      title: "Кешбэк",
                      text: "$3 или $5 на баланс в зависимости от площадки",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Площадок шесть: Яндекс Карты, ВКонтакте, Отзовик, Trustpilot, Google Maps и Facebook, на каждой засчитывается один отзыв. За все шесть клиент получает до $22.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "rum",
            name: "Скорость у реальных пользователей",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Написал скрипт perf-rum.js, который собирает метрики скорости у реальных пользователей. Для 25 % визитов он снимает по каждой странице TTFB, FCP, LCP, INP и CLS, вес страницы, число запросов, картинок и XHR и отправляет их на сервер.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "quality",
            name: "Качество и релизы",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Сам писал три вида тестов: компонентные на Vitest, визуальные регрессионные по эталонным скриншотам блоков и E2E на Playwright для критичных сценариев.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Задача делается в отдельной ветке, проходит CI-проверки и попадает на тестовый стенд. В плановую дату релиза готовые задачи уходят на препрод, идентичный боевому, а после приёмки выкатываются в прод без остановки сервиса. Ошибки на проде отслеживаются постоянно, при проблеме релиз откатывается на прошлую стабильную версию.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "тестовый стенд" },
                    { name: "preprod", next: "приёмка" },
                    { name: "master", next: "прод без остановки" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Работали двухнедельными спринтами. В конце спринта показывали заказчику, что сделано, что нет и почему, и что берём на следующие две недели.",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "challenges",
      name: "Сложности",
      blocks: [
        {
          component: "ProjectCaseChallenges",
          data: {
            items: [
              {
                id: "speed",
                name: "Медленная загрузка страниц",
                rows: [
                  {
                    key: "problem",
                    text: "Местами страница грузилась дольше 5 секунд: списки выводились без пагинации, все картинки загружались сразу, а скрипты и стили шли одним общим бандлом.",
                  },
                  {
                    key: "solution",
                    text: "Добавил пагинацию и ленивую загрузку картинок, разделил JS и CSS по страницам. Для главной Pochtoy собрал облегчённый бандл библиотек: около 700 КБ против 930 КБ у полного. Калькулятор доставки подключил отдельным виджетом на Vue 3. В запросах к базе для витрины выбирал только нужные поля вместо SELECT *.",
                  },
                  {
                    key: "result",
                    text: "Отзывы листаются по страницам, картинки ниже экрана грузятся по мере прокрутки, каждая страница получает только свои скрипты и стили. Замеров «до» и «после» не было, поэтому итог описан списком сделанного, без цифр.",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "results",
      name: "Масштаб платформы",
      blocks: [
        {
          component: "ProjectCaseResults",
          data: {
            stats: [
              {
                value: "2,6 млн",
                label: "посылок отправил Pochtoy.com с 2008 года",
              },
              {
                value: "200 тыс.+",
                label: "посылок отправил Prostobox",
              },
              {
                value: "7 000+",
                label: "посылок в месяц по недельному счётчику на сайтах",
              },
              {
                value: "20 000+",
                label: "клиентов у Pochtoy.com",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Цифры взяты с сайтов в октябре 2026 года. Это масштаб платформы, с которой я работал, а не результат моей работы.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Сайт уже приносит заказы, но медленно грузится?",
      text: "Найду, что тормозит, разделю скрипты и стили по страницам, добавлю пагинацию и ленивую загрузку и настрою замер скорости у реальных пользователей.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default pochtoyProstobox;
