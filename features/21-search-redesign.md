# Feature 21 — Search Redesign

## Overview

Полная переработка механизма поиска: от упрощённой шапки с autocomplete до полноценной страницы поиска с разделёнными результатами и картой. Текущее состояние не подходит ни с точки зрения UX, ни с точки зрения архитектуры.

---

## Текущее состояние (проблемы)

### Frontend

- **Нет страницы поиска** — результаты отображаются в autocomplete прямо в шапке.
- Autocomplete перегружен: иконки категорий, адреса, координаты — всё в одном dropdown.
- Навигация при выборе результата ведёт сразу на `/places/:id` или `/map` — пользователь никогда не видит агрегированных результатов.
- Невозможно поделиться ссылкой на результаты поиска (нет URL).
- Нет фильтрации/сортировки прямо на результатах.

### Backend

- Поиск по местам (`/places?search=`) — простой `LIKE` по `places_content.title` и `places_content.content`. Нет полнотекстового индекса, медленно на больших данных.
- Три разных эндпоинта: `/places`, `/location/search`, `/location/geosearch` — клиент вызывает их по отдельности, нет единой точки входа для поиска.
- Нет унифицированного ответа поиска, клиент сам собирает результаты из разных источников.

---

## Целевое состояние

### UX-флоу

```
Пользователь печатает в шапке
        │
        ▼ (debounce ~300ms, > 2 символов)
  Быстрые подсказки — чистые одностроковые items, без картинок:
  • "Восток-6 — Оренбургская обл." (OSM-адрес)
  • "Заброшенный лагерь «Восток-6»" (POI)
  • "51.123, 58.456" (координаты)
        │
  [Enter] или клик на кнопку "Найти"
        │
        ▼
  /search?q=Восток-6&type=all
  ← Полноценная страница результатов →
```

### Страница поиска `/search`

```
┌────────────────────────────────────────────────────────────┐
│  [← Shorten query input]  [Тип ▾] [Категория ▾] [Сорт. ▾]  │
├─────────────────────────────┬──────────────────────────────┤
│  Левая панель (список)      │  Правая панель (карта)       │
│                             │                              │
│  Адреса 3                   │  Leaflet map                 │
│  ○ Восток-6, Оренб. обл.    │  с маркерами всех            │
│  ○ Восток-6 (посёлок)       │  найденных точек             │
│  ○ Улица Восток-6...        │                              │
│  [Показать ещё 2]           │                              │
│                             │                              │
│  Координаты 1               │                              │
│  ⊕ 51.4345, 58.1234         │                              │
│    [Открыть на карте]       │                              │
│                             │                              │
│  Интересные места 24        │                              │
│  [PlaceCard] Заброшенный... │                              │
│  [PlaceCard] Корпус столо.. │                              │
│  ...                        │                              │
│  [Показать ещё 21 результат]│                              │
└─────────────────────────────┴──────────────────────────────┘
```

**Query params страницы:**
| Параметр | Значение | По умолчанию |
|---|---|---|
| `q` | поисковый запрос | — |
| `type` | `all` / `location` / `coordinates` / `places` | `all` |
| `category` | slug категории | — |
| `sort` | `distance` / `views` / `rating` / `created_at` | `distance` |
| `order` | `asc` / `desc` | `asc` |

---

## Компонент карточки места (PlaceCard для поиска)

Новый компонент **`PlaceSearchCard`** (отличается от существующего `PlaceCard` на главной/каталоге):

```
┌──────────────────────────────────────────────────────┐
│ [Обложка 80×80]  Заброшенный детский лагерь         □│
│                  «Восток-6»                           │
│                  ● Заброшенное                        │
│                  🧑 Mik Catsvill  👁 4.8K  ⊙ 1.2 км  │
└──────────────────────────────────────────────────────┘
```

- Левая часть: квадратная обложка (первое фото) или placeholder-иконка категории
- Правая часть:
  - Название (жирный, 2 строки max + ellipsis)
  - Кнопка "В избранное" (bookmark icon) — справа от названия, только авторизованным
  - Бейдж категории (цветной, с иконкой)
  - Строка метаданных: аватар + ник автора / количество просмотров (сокр.: `4.8K`, `20K`, `1.2M`) / расстояние до пользователя (если координаты доступны)
- Клик → `/places/:id`

---

## Backend Plan

### 1. Новый unified search endpoint

**`GET /search?q={query}&type={all|location|coordinates|places}&category={slug}&sort={field}&order={asc|desc}&lat={lat}&lon={lon}&limit={n}&offset={n}`**

Ответ:
```json
{
  "locations": {
    "items": [
      { "lat": 51.4345, "lon": 58.1234, "country": "...", "region": "...", "locality": "..." }
    ],
    "count": 3
  },
  "coordinates": {
    "lat": 51.4345,
    "lon": 58.1234
  },
  "places": {
    "items": [ /* Place[] как в /places */ ],
    "count": 24
  }
}
```

- `coordinates` — только если `q` распознан как координаты (сервер тоже парсит, не только клиент)
- `locations` — из geocoder (`geoSearch`) + отдельно `locationSearch`
- `places` — из существующего `PlacesContent::search` (c улучшенным поиском — см. ниже)

**Реализация:** Новый контроллер `Search.php`, объединяет логику из `Location::geoSearch`, `Location::search`, `Places::list`.

### 2. Улучшение поиска по местам — релевантность

#### 2.1 Переход с LIKE на MySQL FULLTEXT

Текущий `LIKE '%term%'` — полное сканирование таблицы, нет ранжирования, все результаты равнозначны.

**Шаг 1 — Миграция:** добавить FULLTEXT индекс на `places_content(title, content)`.  
InnoDB поддерживает FULLTEXT с MySQL 5.6+:

```sql
-- Новая миграция: XXXX_add_fulltext_places_content.php
ALTER TABLE places_content ADD FULLTEXT INDEX ft_search (title, content);
```

Если таблица большая — лучше `CREATE FULLTEXT INDEX ft_search ON places_content (title, content)` (не блокирует на MySQL 5.6+ InnoDB).

**Шаг 2 — Настройка минимальной длины токена:**  
По умолчанию `innodb_ft_min_token_size = 3`. Для коротких запросов типа "ГЭС" или "ЦУМ" нужно `= 2`. Добавить в `my.cnf`:
```
[mysqld]
innodb_ft_min_token_size = 2
```
После изменения — пересоздать индекс (`OPTIMIZE TABLE places_content`).  
Если менять конфиг нельзя — fallback на `LIKE` для запросов `strlen($term) <= 3`.

#### 2.2 Взвешенный FULLTEXT: title важнее content

MySQL FULLTEXT не поддерживает per-field boost напрямую, но можно эмулировать через два раздельных индекса и `CASE`-выражение:

```sql
-- Две отдельные FULLTEXT колонки для разных весов
ALTER TABLE places_content ADD FULLTEXT INDEX ft_title (title);
ALTER TABLE places_content ADD FULLTEXT INDEX ft_content (content);
```

В запросе — вычисляем взвешенный score:

```sql
SELECT
    place_id,
    (MATCH(title)   AGAINST (:term IN BOOLEAN MODE) * 10 +
     MATCH(content) AGAINST (:term IN BOOLEAN MODE) * 1 ) AS relevance_score
FROM places_content
WHERE
    MATCH(title)   AGAINST (:term IN BOOLEAN MODE)
    OR MATCH(content) AGAINST (:term IN BOOLEAN MODE)
ORDER BY relevance_score DESC
```

Коэффициент `10:1` — совпадение в заголовке в 10 раз важнее совпадения в тексте. Можно подбирать экспериментально.

В `PlacesContent::search()` реализовать через raw query (`$db->query()`), т.к. CI4 Builder не умеет в сложные MATCH-выражения с алиасами.

#### 2.3 Комбинированный score: текст + популярность

Чистая текстовая релевантность даёт нерелевантные результаты если есть места с редким, но точным совпадением и местами с 100k просмотров. Финальный score должен объединять оба сигнала.

**Схема расчёта финального ранга:**

```
final_score = text_relevance * boost_factor
```

где `boost_factor` — логарифмическое усиление от популярности (логарифм сглаживает разброс):

```sql
SELECT
    pc.place_id,
    (
        (MATCH(pc.title)   AGAINST (:term IN BOOLEAN MODE) * 10 +
         MATCH(pc.content) AGAINST (:term IN BOOLEAN MODE) * 1)
        *
        (1 + LOG(1 + COALESCE(p.views, 0) / 1000))
    ) AS final_score
FROM places_content pc
JOIN places p ON p.id = pc.place_id AND p.deleted_at IS NULL
WHERE
    MATCH(pc.title)   AGAINST (:term IN BOOLEAN MODE)
    OR MATCH(pc.content) AGAINST (:term IN BOOLEAN MODE)
ORDER BY final_score DESC
LIMIT :limit OFFSET :offset
```

- `LOG(1 + views/1000)` — при 0 views boost = 0, при 1000 views ≈ 0.69, при 100k views ≈ 4.6.
- Деление на 1000 нормализует масштаб (иначе views в десятки тысяч доминируют над текстом).
- `COALESCE` защищает от NULL.

Параметры boost нужно калибровать на реальных данных — возможно, `views / 5000` окажется лучше.

#### 2.4 Дедупликация по locale

Текущая `PlacesContent::search()` возвращает записи из всех локалей (ru + en). Одно место может попасть дважды (найдено и в ru, и в en версии).

**Логика дедупликации:**
1. Сначала ищем совпадения в записях с `locale = {текущий locale запроса}`.
2. Fallback: для мест без совпадения в нужном locale — берём совпадение из другого.
3. Одно место = одна запись в результатах.

В SQL: использовать `GROUP BY place_id` с приоритетом локали через `CASE`:

```sql
SELECT place_id, MAX(
    CASE WHEN locale = :locale THEN 2 ELSE 1 END *
    (MATCH(title) AGAINST (:term IN BOOLEAN MODE) * 10 + ...)
) AS final_score
FROM places_content
WHERE MATCH(...) AGAINST (...)
GROUP BY place_id
ORDER BY final_score DESC
```

#### 2.5 Morphology — TODO

Для русского языка базовый FULLTEXT даёт точечное совпадение без учёта морфологии. Пример: запрос "заброшенный" не найдёт "Заброшенное", запрос "лагеря" не найдёт "лагерь".

**Проблема:** MySQL не имеет встроенного Russian stemmer.

**Варианты (для будущего):**

| Вариант | Сложность | Качество | Инфраструктура |
|---|---|---|---|
| **Manticore Search** | Средняя | Высокое | Отдельный сервис, есть Russian morphology |
| **MeiliSearch** | Низкая | Хорошее | Отдельный сервис, поддерживает ru |
| **ElasticSearch** | Высокая | Отличное | Тяжёлый, требует DevOps |
| **PHP-stemmer** (preprocessing) | Низкая | Базовое | Можно прямо в PHP |
| **MySQL NGRAM parser** | Низкая | Среднее | Встроен в MySQL 5.7+ |

**Краткосрочный workaround — N-gram parser:**  
MySQL поддерживает `WITH PARSER ngram` для FULLTEXT — разбивает текст на n-граммы (bigrams/trigrams). Работает для русского без настроек, находит частичные совпадения:

```sql
ALTER TABLE places_content ADD FULLTEXT INDEX ft_ngram (title, content) WITH PARSER ngram;
-- innodb_ft_min_token_size игнорируется, ngram_token_size по умолчанию = 2
```

Минус: ngram увеличивает размер индекса в 3-5x и может давать ложные срабатывания. Подходит как промежуточный шаг до внедрения Manticore/MeiliSearch.

**Рекомендуемый путь:**
1. ✅ Сейчас: FULLTEXT + взвешенный score + locale dedup (этапы 2.1-2.4)
2. 🔜 Следующий шаг: ngram-индекс для частичных совпадений по-русски
3. 📋 TODO: Manticore Search или MeiliSearch как отдельный сервис с Russian morphology

### 3. Подсказки (Suggestions endpoint)

Быстрый lightweight эндпоинт для autocomplete шапки:

**`GET /search/suggest?q={query}`**

Ответ (топ N быстрых результатов, без пагинации):
```json
{
  "suggestions": [
    { "type": "place", "id": 123, "title": "Заброшенный лагерь «Восток-6»" },
    { "type": "location", "title": "Восток-6, Оренбургская обл.", "lat": 51.4, "lon": 58.1 },
    { "type": "coordinates", "lat": 51.4345, "lon": 58.1234 }
  ]
}
```

- Лимит: 5-7 подсказок суммарно
- Кеширование: можно добавить Redis-кеш на 60 сек (опционально, зависит от нагрузки)

---

## Frontend Plan

### 1. Упрощение компонента `Search.tsx` (шапка)

**Что убрать:**
- Иконки/изображения в option items
- Сложная логика сборки option.description
- Прямая навигация на `/places/:id` или `/map` при выборе

**Что оставить/добавить:**
- Однострочный вид подсказок: только `title` (место/адрес/координаты)
- Тип в виде маленького префикса/иконки слева (location pin / star / crosshair)
- Выбор подсказки → заполняет строку поиска, не навигирует
- `Enter` / кнопка "Найти" → `router.push('/search?q=...')`
- Ввод RTK Query endpoint: `useSearchSuggestQuery` → `GET /search/suggest?q=`

**Компонент Autocomplete:** использовать существующий из `simple-react-ui-kit`, убрать лишние пропы.

### 2. Новая страница `/pages/search/index.tsx`

**Структура:**
```
client/
  pages/
    search/
      index.tsx          ← страница поиска
  components/
    pages/
      search/
        SearchFilters/   ← панель фильтров (тип, категория, сортировка)
        SearchResults/   ← левая панель с группами результатов
        SearchMap/       ← правая панель (Leaflet, dynamic import)
        PlaceSearchCard/ ← новый компонент карточки места
        LocationItem/    ← компонент строки OSM-адреса
        CoordinatesItem/ ← компонент строки координат
```

**`getServerSideProps`:**
- Читает `q`, `type`, `category`, `sort`, `order` из query
- Вызывает `store.dispatch(searchApi.endpoints.search.initiate(params))`
- SSR-совместимость: первый рендер с данными (SEO + скорость)

**State Management:**
- URL params — единственный источник истины для фильтров
- Изменение фильтра → `router.push` с новыми params (shallow: false)
- Не нужен локальный state для фильтров

### 3. RTK Query — новые endpoints

В `api/api.ts` добавить:

```typescript
// Unified search (страница результатов)
search: builder.query<ApiType.Search.Response, ApiType.Search.Request>({
    query: (params) => ({ url: 'search', params }),
    keepUnusedDataFor: 60,
}),

// Quick suggestions (шапка)
searchSuggest: builder.query<ApiType.Search.SuggestResponse, string>({
    query: (q) => ({ url: 'search/suggest', params: { q } }),
    keepUnusedDataFor: 30,
}),
```

### 4. Типы (`api/types/search.ts` — новый файл)

```typescript
namespace Search {
    interface Request {
        q: string
        type?: 'all' | 'location' | 'coordinates' | 'places'
        category?: string
        sort?: 'distance' | 'views' | 'rating' | 'created_at'
        order?: 'asc' | 'desc'
        lat?: number
        lon?: number
        limit?: number
        offset?: number
    }

    interface Response {
        locations?: {
            items: ApiModel.GeoSearchLocation[]
            count: number
        }
        coordinates?: {
            lat: number
            lon: number
        }
        places?: {
            items: ApiModel.Place[]
            count: number
        }
    }

    interface SuggestResponse {
        suggestions: Suggestion[]
    }

    type Suggestion =
        | { type: 'place'; id: number; title: string }
        | { type: 'location'; title: string; lat: number; lon: number }
        | { type: 'coordinates'; lat: number; lon: number }
}
```

### 5. Компонент `PlaceSearchCard`

```
client/components/pages/search/PlaceSearchCard/
  index.tsx
  index.module.sass
```

**Props:**
```typescript
interface PlaceSearchCardProps {
    place: ApiModel.Place
    userLat?: number
    userLon?: number
}
```

- Обложка: `place.photos?.[0]` → `<Image>` Next.js; fallback — иконка категории (SVG)
- Название: `place.title`, `font-weight: 600`, 2 строки max
- Bookmark: кнопка, видна только авторизованным, использует существующий RTK mutation
- Категория: бейдж из существующего компонента категорий
- Просмотры: хелпер `formatCount(n)` — `< 1000 → n`, `≥ 1000 → (n/1000).toFixed(1)K`, `≥ 1M → (n/1000000).toFixed(1)M`
- Расстояние: если `userLat`/`userLon` переданы — показывать, иначе — скрыть блок

### 6. Карта на странице поиска (`SearchMap`)

- `next/dynamic` с `ssr: false` (Leaflet требует window)
- Маркеры: все найденные `places` (lat/lon) + все `locations` (lat/lon)
- При клике на маркер → popup с кратким описанием места / адресом
- Координатный результат → особый маркер (crosshair)
- Кнопка "Показать список" / "Показать карту" для мобильной версии (toggle)

### 7. Локализация

Новые ключи в `public/locales/ru/common.json` и `en/common.json`:

```json
{
  "search-page-title": "Поиск: {{query}}",
  "search-results-locations": "Места (OpenStreetMap)",
  "search-results-coordinates": "Координаты",
  "search-results-places": "Интересные места (Geometki)",
  "search-show-more": "Показать ещё {{count}}",
  "search-open-on-map": "Открыть на карте",
  "search-filter-type": "Тип",
  "search-filter-type-all": "Все",
  "search-filter-type-location": "Локация",
  "search-filter-type-coordinates": "Координаты",
  "search-filter-type-places": "Интересные места",
  "search-filter-category": "Категория",
  "search-filter-sort": "Сортировка",
  "search-sort-distance": "По расстоянию",
  "search-sort-views": "По просмотрам",
  "search-sort-rating": "По рейтингу",
  "search-sort-date": "По дате",
  "search-no-results": "Ничего не найдено по запросу «{{query}}»",
  "search-toggle-map": "Карта",
  "search-toggle-list": "Список"
}
```

---

## Файлы, которые затрагиваются

### Backend (server/)

| Файл | Изменение |
|---|---|
| `app/Controllers/Search.php` | **Создать** — unified search controller |
| `app/Config/Routes.php` | Добавить маршруты `/search` и `/search/suggest` |
| `app/Libraries/PlacesContent.php` | Обновить `search()` — добавить FULLTEXT поиск |
| `app/Database/Migrations/XXXX_add_fulltext_places_content.php` | **Создать** — миграция FULLTEXT индекса |

### Frontend (client/)

| Файл | Изменение |
|---|---|
| `components/layout/app-bar/Search.tsx` | Упростить — только подсказки + навигация на `/search` |
| `pages/search/index.tsx` | **Создать** — страница поиска |
| `components/pages/search/SearchFilters/` | **Создать** |
| `components/pages/search/SearchResults/` | **Создать** |
| `components/pages/search/SearchMap/` | **Создать** |
| `components/pages/search/PlaceSearchCard/` | **Создать** |
| `components/pages/search/LocationItem/` | **Создать** |
| `components/pages/search/CoordinatesItem/` | **Создать** |
| `api/api.ts` | Добавить `search` и `searchSuggest` endpoints |
| `api/types/search.ts` | **Создать** — Search namespace |
| `functions/helpers.ts` | Добавить `formatCount(n)` хелпер |
| `public/locales/ru/common.json` | Добавить ключи поиска |
| `public/locales/en/common.json` | Добавить ключи поиска |
| `middleware.ts` | Не нужно — `/search` публичная страница |

---

## Порядок реализации (этапы)

### Этап 1 — Backend foundation
1. Миграция FULLTEXT индекса на `places_content`
2. Обновить `PlacesContent::search()` — FULLTEXT с fallback
3. Создать `Search.php` контроллер с методами `index()` (полный поиск) и `suggest()` (подсказки)
4. Добавить маршруты в `Routes.php`
5. Протестировать через `php spark routes` и curl

### Этап 2 — Frontend types и API
1. Создать `api/types/search.ts`
2. Добавить `search` и `searchSuggest` в `api/api.ts`
3. Добавить `formatCount` в `functions/helpers.ts`

### Этап 3 — Компонент PlaceSearchCard
1. Создать `PlaceSearchCard` с разметкой и стилями
2. Покрыть юнит-тестом (форматирование числа просмотров, скрытие расстояния)

### Этап 4 — Страница поиска
1. Создать все компоненты страницы (SearchFilters, SearchResults, SearchMap, LocationItem, CoordinatesItem)
2. Создать `pages/search/index.tsx` с `getServerSideProps`
3. Добавить переключатель карта/список для мобильных
4. Добавить локализацию

### Этап 5 — Обновление шапки
1. Упростить `Search.tsx` — убрать картинки, упростить option items
2. Переключить на `searchSuggest` endpoint
3. `Enter` / кнопка → `router.push('/search?q=...')`

### Этап 6 — QA и polish
1. Проверить SSR (curl страницы поиска)
2. Проверить SEO-тег title (содержит query)
3. Проверить мобильный вид (карта/список переключение)
4. Проверить пустые состояния (нет результатов, нет координат у пользователя)
5. Проверить навигацию с фильтрами (URL params сохраняются при F5)
6. ESLint fix

---

## Открытые вопросы

1. **Расстояние без геолокации:** если пользователь не дал доступ к координатам, не показывать поле дистанции. На сервере — убрать `distance` из default sort (заменить на `views`). Нужно ли предлагать ввести координаты вручную?
ОТВЕТ: Нет, предлагать воодить координаты врчную не нужно, просто скрывать дистанцию и сортировать по просмотрам.

2. **Пагинация мест:** мокап показывает "Показать ещё 21 результат" — это `load more` (дозагрузка в тот же список) или отдельная страница пагинации? Рекомендация: `load more` (UX лучше для поиска).
ОТВЕТ: Да, `load more` будет лучше для UX, так как пользователю не нужно будет переходить на другую страницу и терять контекст.

3. **Сколько подсказок в шапке:** 5 или 7 строк? По умолчанию предлагаю 5 (2 адреса + 2 места + 1 координата если распознана).
ОТВЕТ: 5 строк будет оптимально, чтобы не перегружать пользователя и сохранять простоту интерфейса.

4. **Кеширование suggest:** стоит ли добавить Redis или хватит клиентского RTK Query cache на 30 сек?
ОТВЕТ: На начальном этапе можно обойтись клиентским кешем RTK Query. Если нагрузка будет высокой, можно будет рассмотреть кеширование в отдельной таблице на БД или на файлах (средствами Codeigniter)

5. **Мобильный дизайн:** в `design_search.png` виден мобильный вид справа — только список, карты нет. Кнопка переключения карта↔список. Надо подтвердить до реализации.
ОТВЕТ: На мобильных устройствах на мокапе карта находится перед списком! Но так как на десктоп версии она находится в правой колонке, то возможно это будет проблемой переместить карту перед списком. Ее тогда можно поместить вниз самый, после списка найденных результатов.
