import type { ProjectBlock } from "../../../api/types/projectCase";

const qwixit = [
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
        { key: "duration", value: "Около 3 месяцев до прода" },
        { key: "status", value: "Завершён, сайт в проде" },
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
          title: "Дизайн целиком",
          text: "Витрина и админка. Около 50 переиспользуемых компонентов собраны в Storybook и переданы команде заказчика.",
        },
        {
          title: "Фронтенд",
          text: "Frontend-архитектура и клиентская часть витрины и админки на Vue 3 и Pinia, включая слой запросов к бэкенду.",
        },
        {
          title: "API для витрины",
          text: "API-эндпоинты на Laravel, через которые витрина получает данные.",
        },
        {
          title: "Интеграции и SEO",
          text: "Оплата, онлайн-чат, вся аналитика и Telegram-бот, который присылает уведомление о каждом заказе. SEO-специалиста в команде не было, поэтому с Яндекс Вебмастером работал сам.",
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
                  text: "Заказчик, американская компания Pochtoy LLC, держит собственный склад в Делавэре. Его покупатели живут в России, им нужны оригинальные товары американских магазинов и брендов: New Balance, Nike, Adidas, Levi's, Tommy Hilfiger, Ralph Lauren, Calvin Klein, Michael Kors, Coach, iHerb.",
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
                  text: "Американские магазины не принимают российские карты и не доставляют в Россию. Сервис закрывает цепочку целиком: цена сразу в рублях, оплата картой РФ или через СБП, выкуп байером, доставка до пункта выдачи.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Своей платформы у заказчика не было вовсе: ни сайта, ни процесса заказа.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "goal",
            name: "Цель",
            blocks: [
              {
                component: "ProjectCaseGoal",
                data: {
                  value: "300+",
                  text: "заказов в месяц. Запуститься на готовой платформе, а не писать магазин с нуля. Стек задавали заказчик и его команда.",
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
            name: "Путь заказа",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Весь продукт строится вокруг одной цепочки, которую покупатель видит в карточке товара как расчётную дату доставки.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Оплата",
                      text: "Картой РФ или через СБП, цена сразу в рублях",
                    },
                    {
                      title: "Выкуп",
                      text: "Байер выкупает товар в течение часа",
                    },
                    {
                      title: "Склад",
                      text: "Делавэр, 4–7 дней из магазина",
                    },
                    {
                      title: "Доставка",
                      text: "Вылеты по вторникам и четвергам, дальше СДЭК: около 5 дней до Москвы и Петербурга, от 10 дней в регионы",
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
            id: "architecture",
            name: "Архитектура",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Заказчик хотел готовую платформу, поэтому за основу команда взяла tlcommerce и сильно его переработала.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Витрина",
                      text: "Vue 3 SPA, Pinia и SASS. Карточки товаров рендерит сервер на Laravel.",
                    },
                    {
                      label: "API",
                      title: "Модульный REST",
                      text: "Каталог, категории и настройки сайта, меню и слайдеры, секции главной и шапки, словари интерфейса.",
                      code: ["ecommerce-core", "theme", "widgets", "locale"],
                    },
                    {
                      label: "SERVICES",
                      title: "Go-модули",
                      text: "Тяжёлые выборки и параллельные вычисления вынесены в модули на Go, очереди работают на RabbitMQ.",
                    },
                    {
                      label: "DATA",
                      title: "Хранилища",
                      text: "PostgreSQL как основная база, Elasticsearch для поиска и каталога, Redis для кэша и сессий, ClickHouse для аналитики, S3 / MinIO для медиа.",
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
            id: "operator",
            name: "Магазин живёт без разработчиков",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Оператор сам ведёт заказы, товары, промокоды и бонусы, меняет баннеры и включает праздничные темы, например к Новому году. Релиз для этого не нужен: главная и шапка собираются из виджетов, которые приходят с API.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Тексты интерфейса загружаются через отдельный эндпоинт локали, поэтому мультиязычность можно добавить без переписывания.",
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
                    { label: "Оплата картами РФ и СБП", own: true },
                    { label: "Онлайн-чат me-talk", own: true },
                    { label: "Яндекс Метрика", own: true },
                    { label: "Google Analytics", own: true, term: true },
                    { label: "Пиксель VK", own: true },
                    { label: "Telegram-бот заказов", own: true },
                    { label: "СДЭК · 25 000+ ПВЗ в 470 городах" },
                    { label: "Maestra · рассылки и попапы подписки" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Каталог наполняется парсингом сайтов магазинов, из которых заказчик готов доставлять.",
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
                  text: "Сервис работает с персональными данными покупателей, в том числе с теми, что нужны для таможенного оформления. Чувствительные поля хранятся в базе зашифрованными, ключ шифрования лежит отдельно от кода и базы. Доступ разграничен по ролям: покупатель, оператор, администратор.",
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
                  text: "Сам писал компонентные тесты на Vitest, визуальные регрессионные по эталонным скриншотам блоков и E2E на Playwright для критичных сценариев.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Каждая задача проходит CI-проверки и тестовый стенд, затем в плановую дату релиза попадает на препрод, идентичный боевому. После приёмки релиз выкатывается в прод без остановки сервиса, а при проблеме можно быстро откатиться на прошлую стабильную версию.",
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
                  text: "Работали двухнедельными спринтами. По итогам каждого показывали заказчику, что сделано, что нет и почему, и сверяли план на следующие две недели.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "При сдаче команда заказчика получила документацию: запуск по шагам, переменные окружения, перечень интеграций, а также Storybook с компонентами витрины и админки.",
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
                id: "seo",
                name: "SEO для SPA",
                rows: [
                  {
                    key: "problem",
                    text: "Покупатель приходит из поиска за конкретным товаром, а большая часть витрины работает как клиентское приложение на Vue 3, которое поисковики индексируют плохо.",
                  },
                  {
                    key: "solution",
                    text: "На сервер вынес точечно то, что нужно поиску: карточки товаров рендерит Laravel, остальное осталось клиентским.",
                  },
                  {
                    key: "result",
                    text: "Карточки товаров отдаются с сервера, поисковик видит H1, цену и разметку schema.org: Product, BreadcrumbList, Organization, FAQPage.",
                  },
                  {
                    key: "retro",
                    text: "Вынес бы клиентскую часть на отдельный Nuxt: каталог рендерится с сервера только частично, а главная и информационные страницы остались клиентскими.",
                  },
                ],
              },
              {
                id: "load",
                name: "Миллион товаров и нагрузка",
                rows: [
                  {
                    key: "problem",
                    text: "Сложные запросы и тяжёлые вычисления по каталогу нагружали основную базу.",
                  },
                  {
                    key: "solution",
                    text: "Командой переписали часть модулей на Go для сложных запросов и параллельных вычислений, а перед базой поставили Elasticsearch, который быстро отдаёт товары.",
                  },
                  {
                    key: "result",
                    text: "Поиск и каталог не перегружают базу, пики нагрузки проходили без заметных проблем.",
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
                value: "300–500",
                label: "заказов в месяц",
              },
              {
                value: "~1 млн",
                label: "товаров в каталоге на момент сдачи",
              },
              {
                value: "40–70 тыс.",
                label: "посетителей в месяц",
              },
              {
                value: "~3 мес.",
                label: "на разработку до запуска",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "Цель заказчика, 300+ заказов в месяц, достигнута через несколько месяцев после запуска.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен интернет-магазин с большим каталогом или продажи в другую страну?",
      text: "Сделаю дизайн, витрину, админку, оплату и аналитику и доведу магазин до запуска.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default qwixit;
