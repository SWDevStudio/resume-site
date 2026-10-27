import type { ProjectBlock } from "../../../api/types/projectCase";

const dobro = [
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
        { key: "role", value: "Тимлид фронтенд-разработки" },
        {
          key: "team",
          value: "15 человек: 5 frontend, 4 backend, 2 дизайнера, 2 QA, PM и DevOps",
        },
        { key: "duration", value: "С марта 2026" },
        { key: "status", value: "В разработке, до релиза" },
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
          title: "Архитектура и стек",
          text: "Выбрал стек и заложил архитектуру фронтенда: слои компонентов ui → form → base → страницы, Server Components по умолчанию, запрет any и as, тесты на каждый компонент.",
        },
        {
          title: "Команда",
          text: "Пришёл разработчиком, через месяц назначили тимлидом. Ставил задачи и приоритеты ещё четырём разработчикам, ревьюил и сливал PR, написал регламенты и онбординг-документ.",
        },
        {
          title: "Код",
          text: "93 задачи сам: UI-кит и поля форм, кабинеты НКО и доноров, страницы НКО и сбора, главная, каталог, шапка и подвал, раздел модерации.",
        },
        {
          title: "Производительность",
          text: "Вся оптимизация от замеров до отчёта: 340 → 4552 rps по 17 маршрутам, медиана ответа 919 → 69 мс.",
        },
      ],
    },
  },
  {
    component: "ProjectCaseChapter",
    data: {
      id: "context",
      name: "Контекст",
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
                  text: "Добро.рф — платформа прозрачной благотворительности, генеральный партнёр — Альфа-Банк. Доноры делают разовые и регулярные пожертвования, собирают корзину из нескольких сборов и смотрят историю. НКО и частные организаторы проходят онбординг, загружают документы, создают сборы и следят за статистикой. Модераторы проверяют сборы.",
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
                  text: "Старой платформы не было: это новый продукт по ТЗ заказчика, разработка с нуля с марта 2026.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Стек задал заказчик: React. Кроме меня, никто во фронтенд-команде на React раньше не писал. А интеграций много: цифровой рубль, оплата в модальном окне прямо на сайте, Альфа-Банк, многоступенчатый онбординг НКО.",
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
            id: "flow",
            name: "Путь пожертвования",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Донор может поддержать сразу несколько сборов одной оплатой: деньги распределяются автоматически, вся история остаётся в кабинете.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Каталог",
                      text: "Фильтры по городу, направлению помощи, реестру СО НКО и приёму цифровых рублей",
                    },
                    {
                      title: "Сбор",
                      text: "Прогресс, «осталось дней», отчёты и журнал транзакций",
                    },
                    {
                      title: "Корзина",
                      text: "Несколько сборов, одна оплата, распределение автоматически",
                    },
                    {
                      title: "Оплата",
                      text: "Карта в модальном окне на сайте, СБП или цифровой рубль",
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
            id: "onboarding",
            name: "Онбординг НКО",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Организация попадает на платформу через мастер из шести шагов. Замечания модератора показываются ошибками полей и не дают отправить анкету, пока их не исправят.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    { title: "Организация", text: "Вход через Госуслуги, реквизиты с подсказками" },
                    { title: "Анкета", text: "Сведения об организации" },
                    { title: "Счёт", text: "Вход через Alfa ID и открытие счёта" },
                    { title: "Документы", text: "Загрузка PDF" },
                    { title: "Подписание", text: "Подписание документов" },
                    { title: "Завершение", text: "Итог проверки, в том числе отказ" },
                  ],
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "architecture",
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Публичная витрина",
                      text: "Главная, каталог сборов, страница сбора, организации, документы. Главная в статике, сборы и НКО в ISR, каталог и организации — динамика с кешем запросов.",
                    },
                    {
                      label: "ACCOUNTS",
                      title: "Кабинеты",
                      text: "Кабинеты доноров и НКО, раздел модерации. Данные грузятся на клиенте: SWR и Zustand, формы на react-hook-form и zod.",
                    },
                    {
                      label: "SERVER",
                      title: "Серверные роуты Next.js",
                      text: "Прокси к API, подсказки DaData с ключом только на сервере, метрики приложения.",
                      code: ["app/api/backend", "app/api/dadata", "app/metrics"],
                    },
                    {
                      label: "API",
                      title: "REST бэкенда",
                      text: "Типы ответов генерируются из OpenAPI, поэтому фронтенд узнаёт об изменении контракта на typecheck.",
                    },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Инвалидация кеша по тегам уже подготовлена: когда бэкенд начнёт присылать вебхуки, интервалы кеша можно поднять в разы.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "design-system",
            name: "Дизайн-система",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Макеты рисовали два дизайнера команды в Figma. По ним фронтенд собрал свою дизайн-систему: токены темы, CSS-компоненты кнопок, карточек и полей, 110 переиспользуемых компонентов. Каждый переиспользуемый компонент принимается через Storybook.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "integrations",
            name: "Интеграции",
            blocks: [
              {
                component: "ProjectCaseIntegrations",
                data: {
                  items: [
                    { label: "Банковские карты · защищённые поля шлюза" },
                    { label: "СБП" },
                    { label: "Цифровой рубль" },
                    { label: "Alfa ID", term: true },
                    { label: "Госуслуги" },
                    { label: "DaData", term: true },
                    { label: "Яндекс Метрика" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Интеграции на фронтенде делала моя группа. Код сам не писал, но по каждой ставил задачи и решал, что использовать.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Способы оплаты приходят с бэкенда. Карта оплачивается в модальном окне на сайте, но данные карты вводятся в поля платёжного шлюза, и сайт их не видит. Корзину и ежемесячные пожертвования можно оплатить картой или через СБП, цифровым рублём — только разовое пожертвование.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "security",
            name: "Безопасность данных",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Ключ DaData живёт только на сервере, запросы идут через серверный роут. HTTP-клиент не отправляет cookie в кешируемых запросах, поэтому персональный ответ не может попасть в общий кеш. Для частных сборов есть согласие на публикацию персональных данных.",
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
                  text: "Vitest и React Testing Library: 48 файлов, около 450 тест-кейсов, базовые тесты на каждый компонент. Отдельно покрыты швы производительности: cookie и кеш в HTTP-клиенте, кеширование публичных ручек, клиентская загрузка справочников. E2E на Playwright пишет другой разработчик: корзина и пожертвование, авторизация, онбординг НКО.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "husky", next: "линт и юнит-тесты на пуше" },
                    { name: "pull request", next: "ревью и CI" },
                    { name: "develop", next: "dev-стенд" },
                    { name: "preprod", next: "prod" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Проверки на пуше настроил я, GitHub Actions, Docker и деплой — DevOps команды.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Работаем недельными спринтами с демо в конце каждого. Задачи в Jira, ветка на задачу, PR с ревью. Для новых разработчиков есть онбординг-документ: слои, нейминг, паттерны, формы, тесты, Storybook. Для AI-агентов — правила и скиллы проекта: ревью ветки, тесты, токены темы.",
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
                id: "rps",
                name: "20 rps на любой странице",
                rows: [
                  {
                    key: "problem",
                    text: "Корневой layout на каждый запрос ждал два ответа API, до секунды: проверку авторизации и данные шапки, из которых использовалось одно поле. Из-за чтения cookie все 39 маршрутов были динамическими, кеша не было нигде.",
                  },
                  {
                    key: "solution",
                    text: "Замерил оба варианта и перенёс авторизацию в клиент: 182 rps против 15,5 у серверного с кешем шапки. Публичные ручки пометил на кеширование с тегами, главную перевёл в статику, страницы сбора и НКО — в ISR, справочник фильтров на 130 КБ вынес из HTML, кабинеты перевёл на клиентскую загрузку, 109 PNG — в webp.",
                  },
                  {
                    key: "result",
                    text: "17 маршрутов: 340 → 4552 rps суммарно, медиана ответа 919 → 69 мс. Статических маршрутов стало 17 и ещё 2 в ISR, HTML каталога похудел с 254 до 169 КБ, картинки в сборке — с 13 до 1,4 МБ.",
                  },
                ],
              },
              {
                id: "empty-page",
                name: "Ускорение, которое оказалось пустой страницей",
                rows: [
                  {
                    key: "problem",
                    text: "После перевода страницы сбора в ISR замер показал рост в 15 раз. На деле сервер отдавал пустую оболочку: useSearchParams() ронял страницу в клиентский рендер, в HTML осталось 659 символов текста вместо 2398. Ни typecheck, ни 444 теста этого не поймали.",
                  },
                  {
                    key: "solution",
                    text: "Нашёл это сам на ревью своей ветки. Чтение параметра суммы вынесли в эффект, а в регламент добавили проверку маркеров клиентского рендера и объёма видимого текста после перевода маршрута в статику.",
                  },
                  {
                    key: "result",
                    text: "Страница осталась в ISR и держит 196 rps уже с полным контентом.",
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
      name: "Метрики и результаты",
      blocks: [
        {
          component: "ProjectCaseResults",
          data: {
            stats: [
              {
                value: "×13",
                label: "больше запросов в секунду: 340 → 4552 rps",
              },
              {
                value: "69 мс",
                label: "медиана ответа вместо 919 мс",
              },
              {
                value: "100",
                label: "Lighthouse в Accessibility, Best Practices и SEO, Performance 90+",
              },
              {
                value: "37",
                label: "страниц, из них 20 в кабинетах",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Нагрузку мерил autocannon на prod-сборке, 20 соединений. Lighthouse — Unlighthouse по всем страницам сайта. Бизнес-метрик пока нет: платформа ещё не вышла в релиз.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен большой проект на Next.js или команда, которая быстро освоит новый стек?",
      text: "Заложу архитектуру и регламенты, выстрою работу фронтенд-команды и разгоню сайт под нагрузку.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default dobro;
