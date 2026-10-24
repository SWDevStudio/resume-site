import type { ProjectBlock } from "../../../api/types/projectCase";

const brendmart = [
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
        { key: "team", value: "2 fullstack-разработчика и junior frontend-разработчик" },
        { key: "duration", value: "С января 2025 по март 2026, запуск в мае 2025" },
        { key: "status", value: "Сдан, магазин работает" },
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
          title: "Дизайн и UI-кит",
          text: "Дизайн сайта полностью мой. UI-кит собран на daisyUI, поэтому оформление меняется сменой темы.",
        },
        {
          title: "Витрина на Nuxt",
          text: "Предложил и внедрил Nuxt: витрина работает отдельным приложением с серверным рендером, а не частью монолита.",
        },
        {
          title: "Админка и API",
          text: "Клиентская часть админки оператора, слой запросов к бэкенду для админки и витрины, API-эндпоинты на Laravel для витрины.",
        },
        {
          title: "Ревью",
          text: "Ревьюил merge requests junior frontend-разработчика.",
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
                  text: "Brendmart продаёт одежду, обувь и аксессуары мировых брендов из европейских магазинов, люкс и масс-маркет: Prada, Brunello Cucinelli, Max Mara, Etro, Swarovski. Покупатели живут в России, Беларуси и Казахстане.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Заказчик выкупает товар у зарубежного продавца по поручению покупателя и доставляет его в страны ЕАЭС. Магазин запущен в мае 2025 года.",
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
            name: "Как покупают",
            blocks: [
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Каталог",
                      text: "Цена товара уже включает доставку и пошлины",
                    },
                    {
                      title: "Консьерж",
                      text: "Если товара нет в каталоге, можно оставить заявку на выкуп",
                    },
                    {
                      title: "Корзина",
                      text: "Корзина и избранное хранятся в гостевой сессии, регистрация не нужна",
                    },
                    {
                      title: "Доставка",
                      text: "Товар выкупают у продавца в Европе, экспресс-доставка от 5 дней",
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
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Витрина на Nuxt",
                      text: "Отдельное приложение с серверным рендером на Nuxt 4, Pinia, Tailwind и daisyUI. Данные страниц приходят в _payload.json.",
                    },
                    {
                      label: "API",
                      title: "Публичный REST",
                      text: "Корзина, избранное, кэшированное дерево категорий. Гостевая сессия идёт через прокси и хранится в подписанной куке.",
                      code: ["/api/public/v1", "/cached/categories-tree", "/proxy/session/guest"],
                    },
                    {
                      label: "ADMIN",
                      title: "Админка оператора",
                      text: "Закрытая часть, в которой оператор ведёт магазин.",
                    },
                    {
                      label: "BACKEND",
                      title: "Сервисы и данные",
                      text: "Laravel и Go, очереди на RabbitMQ. PostgreSQL, Redis, Elasticsearch, ClickHouse, S3 / MinIO.",
                    },
                    {
                      label: "INFRA",
                      title: "Инфраструктура",
                      text: "Docker, Traefik, Kubernetes и Argo CD, сборка в GitLab CI. Логи в ELK, метрики в Grafana и Prometheus.",
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
            id: "server-driven",
            name: "Страницы собираются из API",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Чтобы поменять главную, релиз не нужен. Бэкенд отдаёт страницу JSON-массивом, устроенным как дерево, и витрина собирает по нему страницу из компонентов.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Так собрана главная, и так же можно собрать любую другую страницу: контент и структура меняются через API.",
                },
              },
            ],
          },
        },
        {
          component: "ProjectCaseChapter",
          data: {
            id: "storefront",
            name: "Поиск, языки и доступность",
            blocks: [
              {
                component: "ProjectCaseText",
                data: {
                  text: "Поисковик получает готовую страницу с сервера: со своими title, description, Open Graph и разметкой schema.org WebSite и WebPage. Интерфейс переведён на русский, английский и испанский.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "На витрине начали делать поддержку доступности: семантическая разметка областей страницы, alt у картинок, подписи у кнопок и ссылок, масштабирование не запрещено.",
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
                    { label: "Оплата картами" },
                    { label: "Онлайн-чат Jivo" },
                    { label: "Яндекс Метрика" },
                  ],
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
                  text: "Для таможенного оформления магазин хранит персональные данные покупателей. Такие поля шифруются в базе встроенными средствами Laravel, а ключ лежит отдельно от кода и базы. Доступ разделён на два уровня: покупатели и сотрудники (операторы и администраторы).",
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
                  text: "Я писал три вида тестов: компонентные на Vitest, визуальные регрессионные со сравнением блока с эталонным скриншотом и E2E на Playwright для критичных сценариев.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Задача живёт в своей ветке и после слияния в develop проходит CI-проверки и попадает на тестовый стенд. В день релиза собирается ветка preprod для приёмки в окружении, как на проде, затем master обновляет боевой сервер без остановки.",
                },
              },
              {
                component: "ProjectCasePipeline",
                data: {
                  stages: [
                    { name: "develop", next: "CI и тестовый стенд" },
                    { name: "preprod", next: "итоговая приёмка" },
                    { name: "master", next: "релиз без простоя" },
                  ],
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Ошибки на проде отслеживаются постоянно, и при проблеме релиз быстро откатывается на прошлую стабильную версию.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Спринты длились две недели. В конце каждого заказчик видел, что готово, что нет и почему, и вместе с ним планировали следующие две недели.",
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
                id: "nuxt",
                name: "Витрина отдельно от монолита",
                rows: [
                  {
                    key: "problem",
                    text: "Витрину внутри монолита трудно развивать отдельно от бэкенда и нельзя переиспользовать на других платформах.",
                  },
                  {
                    key: "solution",
                    text: "Предложил и внедрил Nuxt. Витрина стала отдельным приложением с серверным рендером и берёт данные из публичного API бэкенда.",
                  },
                  {
                    key: "result",
                    text: "Витрину можно расширять, не трогая бэкенд, а мобильные приложения собрать из того же кода, добавив Capacitor.",
                  },
                ],
              },
              {
                id: "themes",
                name: "Новая стилистика за день",
                rows: [
                  {
                    key: "problem",
                    text: "Стилистику часто приходилось менять по запросу заказчика, а рисовать каждый вариант в Figma долго.",
                  },
                  {
                    key: "solution",
                    text: "Построил оформление на Tailwind и daisyUI так, чтобы тема переключалась целиком, а оформление магазина вынесено в собственную тему daisyUI. Прототип и варианты темы быстро получали через GPT-4: просили сверстать прототип и предложить несколько вариантов.",
                  },
                  {
                    key: "result",
                    text: "От запроса заказчика до прототипа страницы в новой теме проходило не больше часа. Пересобрать весь проект в новой стилистике можно за день благодаря UI-киту на daisyUI.",
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
                value: "600+",
                label: "заказов в месяц на момент сдачи",
              },
              {
                value: "2 млн+",
                label: "товаров в каталоге",
              },
              {
                value: "~4 мес.",
                label: "от начала разработки до запуска",
              },
              {
                value: "≤ 1 ч",
                label: "на прототип новой темы по запросу заказчика",
              },
            ],
          },
        },
        {
          component: "ProjectCaseText",
          data: {
            text: "К сдаче магазин принимал больше 600 заказов в месяц от покупателей из России, Беларуси и Казахстана.",
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен магазин с большим каталогом, который легко перекрасить под новую стилистику?",
      text: "Нарисую дизайн и UI-кит, сделаю витрину на Nuxt с серверным рендером, админку и API.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default brendmart;
