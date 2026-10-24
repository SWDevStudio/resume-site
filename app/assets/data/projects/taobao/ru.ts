import type { ProjectBlock } from "../../../api/types/projectCase";

const taobao = [
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
        { key: "duration", value: "Январь 2025 – март 2026" },
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
          title: "Дизайн и UI-кит",
          text: "Дизайн сайта полностью мой. UI-кит построен на Tailwind и daisyUI со своей темой, поэтому оформление меняется сменой темы.",
        },
        {
          title: "Витрина на Nuxt",
          text: "Предложил сделать витрину отдельным приложением на Nuxt с серверным рендером. Сам собрал её клиентскую часть: Pinia, русский и английский интерфейс, слой запросов к API.",
        },
        {
          title: "Админка",
          text: "Клиентская часть рабочего места оператора и её запросы к бэкенду.",
        },
        {
          title: "API для витрины",
          text: "Эндпоинты на Laravel, из которых витрина получает данные.",
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
                  text: "Заказчик выкупает и доставляет товары из Китая и Гонконга. Его покупатели живут в России и заказывают IKEA, технику Apple для рынка Гонконга, одежду и обувь с Farfetch, компьютерные комплектующие.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Если нужного товара нет в каталоге, его можно заказать заявкой на выкуп.",
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
                  text: "Цена в каталоге сразу в рублях и уже включает пошлины, комиссию сервиса и доставку. Дальше заказ проходит четыре шага.",
                },
              },
              {
                component: "ProjectCaseSteps",
                data: {
                  steps: [
                    {
                      title: "Заказ",
                      text: "Из каталога или заявкой на выкуп. Корзина и избранное работают без регистрации",
                    },
                    {
                      title: "Оплата",
                      text: "Картой МИР или через СБП",
                    },
                    {
                      title: "Проверка",
                      text: "Комплектность заказа проверяют перед отправкой",
                    },
                    {
                      title: "Доставка",
                      text: "17–28 дней до России, статус виден в личном кабинете. Получение в пункте выдачи или курьером",
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
                  text: "Витрина живёт отдельно от бэкенда. Её проще развивать, а мобильные приложения можно собрать из того же кода, добавив Capacitor.",
                },
              },
              {
                component: "ProjectCaseArchitecture",
                data: {
                  items: [
                    {
                      label: "STOREFRONT",
                      title: "Витрина",
                      text: "Nuxt 4 с серверным рендером, Pinia и Nuxt i18n, UI-кит на Tailwind и daisyUI.",
                    },
                    {
                      label: "API",
                      title: "Публичный API",
                      text: "Корзина, избранное и блоки товаров для главной. Гостевая сессия держится на подписанной куке, поэтому покупателю не нужно регистрироваться заранее.",
                      code: ["/api/public/v1", "catalog/block-products"],
                    },
                    {
                      label: "ADMIN",
                      title: "Админка",
                      text: "Рабочее место операторов сервиса.",
                    },
                    {
                      label: "BACKEND",
                      title: "Сервисы и данные",
                      text: "Laravel и Go, очереди на RabbitMQ. Данные в PostgreSQL, Redis, Elasticsearch, ClickHouse и S3 / MinIO.",
                    },
                    {
                      label: "INFRA",
                      title: "Инфраструктура",
                      text: "Docker и Kubernetes, выкатка через GitLab CI и Argo CD, трафик через Traefik и Envoy. Мониторинг на Grafana, Prometheus и ELK.",
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
                  text: "Структуру и содержимое страницы можно поменять без релиза витрины. Бэкенд отдаёт JSON-массив, устроенный как абстрактное синтаксическое дерево, и витрина собирает по нему страницу.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Так собрана главная, блоки товаров на ней приходят из catalog/block-products. Тем же способом можно собрать любую другую страницу.",
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
                  text: "Для таможенного оформления сервис хранит персональные данные покупателей. Чувствительные поля в базе зашифрованы встроенными средствами Laravel, а ключ хранится отдельно и от кода, и от базы. Права разделены между покупателями, операторами и администраторами.",
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
                  text: "На мне были три вида тестов: компонентные на Vitest, визуальные регрессионные со сверкой блоков по эталонным скриншотам и E2E на Playwright для критичных сценариев. Код junior frontend-разработчика проходил через моё ревью.",
                },
              },
              {
                component: "ProjectCaseText",
                data: {
                  text: "Задача из отдельной ветки попадает в develop, проходит автотесты и проверки качества кода и выкатывается на тестовый стенд. В плановую дату релиза готовые задачи собираются в preprod, на стенде, идентичном боевому, идут итоговое тестирование и приёмка. Затем релиз сливается в master и обновляет прод без остановки сервиса. Если на проде что-то ломается, можно быстро вернуться к прошлой стабильной версии.",
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
                  text: "Спринты длились две недели. В конце каждого заказчик видел, что сделано, что нет и почему, и что запланировано на следующие две недели.",
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
                id: "a11y",
                name: "Доступность в UI-ките",
                rows: [
                  {
                    key: "solution",
                    text: "Доступность заложена в сам UI-кит: семантические области страницы, видимый фокус и логичный порядок обхода с клавиатуры, alt у картинок, доступные имена у кнопок и ссылок. Масштабирование не запрещено, вырез экрана на телефонах учтён.",
                  },
                  {
                    key: "result",
                    text: "Проверка axe-core по WCAG 2.2 AA и ручной обход с клавиатуры на главной, в категории и в карточке товара, на ПК и на телефоне, нашли одно нарушение. Фирменный красный даёт контраст 4,1:1 при норме 4,5:1, и это лечится затемнением красного на пару тонов в теме daisyUI.",
                  },
                ],
              },
              {
                id: "theming",
                name: "Новое оформление за день",
                rows: [
                  {
                    key: "problem",
                    text: "Заказчик приходил с запросами на новую стилистику витрины, и её нужно было быстро показать и выкатить.",
                  },
                  {
                    key: "solution",
                    text: "Выбрал Tailwind и daisyUI: компоненты UI-кита берут оформление из темы, своей taobao_v2 или стандартных light и dark. Прототип новой темы генерировали через GPT-4.",
                  },
                  {
                    key: "result",
                    text: "По моей оценке, без замеров: страница-прототип в новой стилистике готова меньше чем за час после запроса, пересборка сайта занимает не больше дня.",
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
                label: "товаров в каталоге на момент сдачи",
              },
            ],
          },
        },
      ],
    },
  },
  {
    component: "ProjectCaseCta",
    data: {
      id: "cta",
      title: "Нужен сервис доставки из-за рубежа или витрина, которую можно перекрасить за день?",
      text: "Сделаю дизайн и UI-кит с доступностью, витрину на Nuxt и API для неё.",
    },
  },
  {
    component: "ProjectCaseNext",
    data: {},
  },
] satisfies ProjectBlock[];

export default taobao;
