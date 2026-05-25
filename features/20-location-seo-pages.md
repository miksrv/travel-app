# 20. Location SEO Pages — Семантические страницы по локациям и категориям

## Проблема

- URL вида `/places?locality=1&category=abandoned` не читаемы и слабы для SEO
- Заголовки вида "Интересные места: Оренбург, Заброшенное" не соответствуют реальным поисковым запросам
- Упущенный трафик по geo-запросам ("заброшенные места в Оренбурге", "интересные места в Оренбургской области")
- Meta description дублирует title — нет уникального описания

---

## Целевая URL-архитектура

### Плоская структура (без иерархии в URL)

```
/places                              → все места (существующая, без изменений)
/places/[category]                   → /places/abandoned, /places/waterfall
/places/[location-slug]              → /places/orenburg, /places/russia
/places/[location-slug]/[category]   → /places/orenburg/abandoned
```

**Иерархия — в breadcrumbs, не в URL.** URL `/places/orenburg` работает для любого уровня (страна, регион, город). Полный контекст "Россия → Оренбургская область → Оренбург" передаётся через schema.org `BreadcrumbList`.

### Почему не `/places/russia/orenburg-oblast/orenburg/abandoned`

- Никто так не ищет — запрос "заброшенные места в Оренбурге", а не "russia orenburg-oblast orenburg abandoned"
- Административные границы в России меняются — длинные URL ломаются
- Booking.com, 2ГИС, TripAdvisor — все используют короткий URL + breadcrumb

### Поддерживаемые уровни локаций

| Уровень | Пример URL | Ценность |
|---|---|---|
| Страна | `/places/russia` | Высокая конкуренция |
| Регион | `/places/orenburg-oblast` | Средняя конкуренция, реально ранжироваться |
| Город (locality) | `/places/orenburg` | Низкая конкуренция, лучший ROI |
| Район (district) | — | Не реализуем (почти нет поискового спроса) |

---

## Slug-генерация

### Naming convention для slug

Слаг генерируется из `title_en` (транслитерация для `title_ru`):

```
Страна:    russia, ukraine, kazakhstan
Регион:    orenburg-oblast, stavropol-krai, tatarstan, primorsky-krai
Город:     orenburg, saint-petersburg, lermontov
```

Регионы содержат тип (-oblast, -krai, -respublika) — коллизия с городами исключена естественно. `orenburg` — город, `orenburg-oblast` — регион.

### Алгоритм генерации

1. Взять `title_en` (или транслитерировать `title_ru` по ГОСТ)
2. Привести к нижнему регистру
3. Заменить пробелы и спецсимволы на `-`
4. Убрать лишние дефисы
5. Обрезать до 80 символов по границе слова
6. Проверить уникальность в своей таблице → при коллизии добавить числовой суффикс

### PHP-реализация

Библиотека `cocur/slugify` с поддержкой русской транслитерации или встроенный `transliterator_transliterate('Russian-Latin/BGN', $str)`.

### Когда запускается генерация slug и морфологии

**Два момента, не один:**

**1. Разовая миграция существующих данных — CodeIgniter Command**

```bash
php spark locations:generate-slugs
```

Команда проходит по всем записям `location_countries`, `location_regions`, `location_localities`, генерирует `slug` и `name_prepositional_ru` через библиотеку `morphos`, сохраняет в БД. Запускается один раз после деплоя миграций.

**2. При добавлении/редактировании места — существующий скрипт геокодирования**

В проекте уже есть скрипт, который при создании или редактировании места получает адрес и заполняет таблицы локаций (`location_localities`, `location_regions` и т.д.). Этот скрипт нужно дополнить: если запись локации создаётся впервые — сразу генерировать и сохранять `slug` и `name_prepositional_ru`. Таким образом новые локации попадают в БД уже с заполненными SEO-полями, без ручного вмешательства.

---

## Разрешение конфликтов в роутинге `/places/[slug]`

Категории (`abandoned`, `waterfall` и т.д.) — фиксированный enum, известны заранее. Алгоритм в `getServerSideProps`:

```
1. slug совпадает с известной категорией?  → рендер страницы категории
2. slug найден в location_localities?      → рендер страницы города
3. slug найден в location_regions?         → рендер страницы региона
4. slug найден в location_countries?       → рендер страницы страны
5. Ничего не найдено                       → 404
```

Для `/places/[location]/[category]` — сначала резолвим `location` как выше, затем проверяем `category` в enum.

---

## Шаблоны title и description

### Принцип: PHP даёт данные, Next.js собирает строку

PHP **не генерирует готовый заголовок** — он возвращает морфологические формы как поля данных. Сборка строки — задача Next.js, потому что шаблоны принадлежат i18n-слою (`public/locales/`). При добавлении нового языка меняется только файл локали, PHP не трогается.

**Что возвращает API:**

```json
{
  "locality": {
    "name_ru": "Оренбург",
    "name_en": "Orenburg",
    "name_prepositional_ru": "Оренбурге"
  },
  "category": {
    "name": "abandoned",
    "title_adj_ru": "Заброшенные",
    "title_adj_en": "Abandoned"
  },
  "places_count": 87
}
```

**Что делает Next.js (`getServerSideProps`):**

```ts
// public/locales/ru/common.json
"seo-places-locality":          "Интересные места в {{prepositional}}",
"seo-places-category-locality": "{{adj}} места в {{prepositional}}",
"seo-desc-locality":            "Найдено {{count}} мест в {{prepositional}}. Карта, фото, описания.",
"seo-desc-category-locality":   "{{count}} {{adj_lower}} мест в {{prepositional}} с фото и описаниями.",

// Сборка:
const title = category
    ? t('seo-places-category-locality', {
          adj: category.title_adj_ru,
          prepositional: locality.name_prepositional_ru
      })
    : t('seo-places-locality', { prepositional: locality.name_prepositional_ru })
```

**Результаты:**

```
/places/orenburg             → "Интересные места в Оренбурге"
/places/orenburg-oblast      → "Интересные места в Оренбургской области"
/places/russia               → "Интересные места в России"
/places/abandoned            → "Заброшенные места"
/places/orenburg/abandoned   → "Заброшенные места в Оренбурге"
```

### Кто заполняет `name_prepositional_ru`

Библиотека **`wapmorph/morphos`** (PHP, локальная, без внешних запросов) — запускается в Command при миграции и в геокодирующем скрипте при создании новой локации. Morpher.ru API как альтернатива, если `morphos` даёт неточный результат для конкретного топонима.

### description (отдельно от title, содержит count)

```
/places/orenburg           → "Найдено 87 мест в Оренбурге. Карта, фото, описания."
/places/orenburg/abandoned → "87 заброшенных мест в Оренбурге с фото и описаниями."
```

---

## Breadcrumbs (UI + schema.org)

### Детальная страница места — текущий UI оставить как есть

Текущая структура уже оптимальна для мобайла (80% трафика) — две короткие строки вместо одной длинной цепочки:

```
Геометки / Интересные места / Религиозное сооружение   ← строка навигации (шапка)
─────────────────────────────────────────────────────
Второафонский Успенский монастырь                      ← H1
Россия, Ставропольский край, городской округ Лермонтов ← геоконтекст (под заголовком)
```

Все 6 элементов — ссылки. Визуально читаемо на мобайле, не требует изменений.

**Что нужно сделать:**
1. Обновить ссылки адреса — с `/places?locality=1` на `/places/stavropol-krai`, `/places/lermontov` и т.д.
2. Обновить ссылку категории — с `/places?category=religious` на `/places/religious`
3. Добавить schema.org `BreadcrumbList` в JSON-LD — объединить обе строки в одну логическую цепочку:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Геометки", "item": "https://geometki.com/" },
    { "@type": "ListItem", "position": 2, "name": "Интересные места", "item": "https://geometki.com/places" },
    { "@type": "ListItem", "position": 3, "name": "Религиозные сооружения", "item": "https://geometki.com/places/religious" },
    { "@type": "ListItem", "position": 4, "name": "Ставропольский край", "item": "https://geometki.com/places/stavropol-krai" },
    { "@type": "ListItem", "position": 5, "name": "Лермонтов", "item": "https://geometki.com/places/lermontov" },
    { "@type": "ListItem", "position": 6, "name": "Второафонский Успенский монастырь" }
  ]
}
```

Визуально разделено на две строки — в JSON-LD единая цепочка. Google воспринимает корректно.

### Алгоритм сборки BreadcrumbList для места

```
1. Геометки        → /
2. Интересные места → /places
3. Категория       → /places/{category}
4. Регион          → /places/{region_slug}       (если есть region_id)
5. Город           → /places/{locality_slug}     (если есть locality_id)
   или District    → текст без ссылки             (если только district_id)
6. Название места  → текущая страница, без item
```

### SEO-страницы локаций — breadcrumb в шапке

```
/places/orenburg/abandoned:
  Главная › Места › Оренбург › Заброшенные
```

JSON-LD `BreadcrumbList` на каждой странице — передаёт Google полный географический контекст без иерархии в URL.

---

## Структура страниц (UI)

### Страница локации `/places/orenburg`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Оренбургская обл. / Оренбург   │
├─────────────────────────────────────────────────────┤
│  H1: Интересные места в Оренбурге                   │
│  Найдено 87 мест                                    │
├──────────────┬──────────────────────────────────────┤
│  Мини-карта  │  Категории в Оренбурге:              │
│  с кластера  │  Заброшенные (12) · Природа (8) ...  │
│  ми мест     │  (ссылки → /places/orenburg/[cat])   │
│              ├──────────────────────────────────────┤
│              │  Список / Сетка карточек мест        │
├──────────────┴──────────────────────────────────────┤
│  Другие города Оренбургской области:                │
│  Орск · Бузулук · Новотроицк                        │
└─────────────────────────────────────────────────────┘
```

- Мини-карта: точки всех мест города — осмысленно, территория компактная
- Блок категорий: фильтры с количеством → переход на `/places/orenburg/[cat]`
- Блок "Другие города региона" — внутренняя перелинковка, распределяет PageRank

---

### Страница категории `/places/abandoned`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Заброшенные                    │
├─────────────────────────────────────────────────────┤
│  H1: Заброшенные места                              │
│  [текст из category.content — описание категории]   │
│  Найдено 342 места                                  │
├─────────────────────────────────────────────────────┤
│  Заброшенные места по городам:                      │
│  Оренбург (12) · Ставрополь (9) · Краснодар (7)... │
│  (ссылки → /places/[city]/abandoned)                │
├─────────────────────────────────────────────────────┤
│  Список / Сетка карточек мест                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Похожие категории:                                 │
│  Военные объекты · Шахты · Замки                    │
└─────────────────────────────────────────────────────┘
```

- Мини-карта **не нужна** — точки разбросаны по всей России, карта не даёт смысла
- Блок "по городам" — ключевой для внутренней перелинковки → `/places/orenburg/abandoned`
- Текст `category.content` из БД — SEO-описание категории, уже есть в модели
- Блок похожих категорий — удерживает пользователя, добавляет перелинковку

---

### Страница локация + категория `/places/orenburg/abandoned`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Оренбург / Заброшенные         │
├─────────────────────────────────────────────────────┤
│  H1: Заброшенные места в Оренбурге                  │
│  Найдено 12 мест                                    │
├──────────────┬──────────────────────────────────────┤
│  Мини-карта  │  Список / Сетка карточек мест        │
│  (Оренбург,  │                                      │
│  только      │                                      │
│  заброшенные)│                                      │
├──────────────┴──────────────────────────────────────┤
│  Другие категории в Оренбурге:                      │
│  Природа (8) · Религиозные (5) · Памятники (4)     │
│  (ссылки → /places/orenburg/[cat])                  │
├─────────────────────────────────────────────────────┤
│  Заброшенные места рядом:                           │
│  Орск (7) · Бузулук (3) · Оренбургская обл. (34)   │
│  (ссылки → /places/[city]/abandoned)                │
└─────────────────────────────────────────────────────┘
```

- Мини-карта **нужна** — и локация, и категория конкретны, точек немного
- Два блока перелинковки дают матрицу связей: город × категория
  - "Другие категории в Оренбурге" → фиксируем город, меняем категорию
  - "Заброшенные места рядом" → фиксируем категорию, меняем город

---

## Взаимодействие фильтров и SEO-URL

### Один компонент для всех трёх URL

`/places`, `/places/orenburg`, `/places/orenburg/abandoned` — один React-компонент. Дизайн не прыгает: основной контент стоит на месте, SEO-блоки появляются снизу по мере уточнения фильтра.

```
┌─────────────────────────────────────┐
│  Фильтры                            │  ← всегда, не двигается
├─────────────────────────────────────┤
│  H1 + счётчик                       │  ← текст меняется, позиция нет
├────────────┬────────────────────────┤
│  Карта     │  Карточки мест         │  ← карта появляется если есть локация
│  (если     │                        │
│  локация)  │                        │
├────────────┴────────────────────────┤
│  Категории / По городам / Рядом     │  ← появляется снизу (контекстно)
└─────────────────────────────────────┘
```

### Как меняется URL при выборе фильтра

Фильтр делает `router.push()` — не перезагрузку, а React-навигацию. Страница не перемонтируется, список обновляется плавно:

```
Выбрал локацию "Оренбург":
  /places  →  /places/orenburg

Выбрал категорию "Заброшенные":
  /places/orenburg  →  /places/orenburg/abandoned

Снял локацию:
  /places/orenburg/abandoned  →  /places/abandoned

Сбросил все фильтры:
  /places/abandoned  →  /places
```

### Два сценария использования

**A — пользователь фильтрует вручную на `/places`**
URL меняется через `router.push()`, список обновляется, SEO-блоки появляются снизу. Пользователь не замечает смены "режима".

**B — пользователь пришёл из Google на `/places/orenburg/abandoned`**
Видит готовую страницу с мини-картой, блоком категорий, блоком соседних городов. Это его точка входа, дальше может фильтровать как в сценарии A.

### Редиректы со старых query-param URL

Старые URL вида `/places?locality=1&category=abandoned` могут быть проиндексированы Google. Нужны серверные 301-редиректы в Next.js (`next.config.js` или middleware):

```
/places?locality=1               → 301 → /places/orenburg
/places?locality=1&category=abandoned → 301 → /places/orenburg/abandoned
/places?category=abandoned       → 301 → /places/abandoned
```

Для этого нужно: при инициализации приложения загружать маппинг `locality_id → slug` (или резолвить на лету в middleware через API-запрос к `/locations/resolve`).

---

## SEO-паттерны

| Паттерн | Реализация |
|---|---|
| Canonical | На пагинации (страница 2+) canonical → страница 1 |
| Hreflang | `/en/places/orenburg` ↔ `/places/orenburg` |
| Sitemap | Авто-генерация XML для всех активных локаций + категорий |
| BreadcrumbList JSON-LD | На каждой SEO-странице |
| ItemList JSON-LD | Список мест на странице |
| noindex | Локации с 0 мест — закрыть от индексации |
| noindex | geo-фильтр (lat/lon) — уже реализован |

---

## Технические требования

### БД — новые поля

```sql
-- В каждой таблице локаций (countries, regions, localities)
ALTER TABLE location_localities ADD COLUMN slug VARCHAR(120) UNIQUE;
ALTER TABLE location_localities ADD COLUMN name_prepositional_ru VARCHAR(120);

ALTER TABLE location_regions ADD COLUMN slug VARCHAR(120) UNIQUE;
ALTER TABLE location_regions ADD COLUMN name_prepositional_ru VARCHAR(120);

ALTER TABLE location_countries ADD COLUMN slug VARCHAR(120) UNIQUE;
ALTER TABLE location_countries ADD COLUMN name_prepositional_ru VARCHAR(120);

-- В таблице категорий
ALTER TABLE category ADD COLUMN title_adj_ru VARCHAR(100);  -- "Заброшенные"
ALTER TABLE category ADD COLUMN title_adj_en VARCHAR(100);  -- "Abandoned"
```

### Сервер (PHP / CodeIgniter 4)

- Функция `generateSlug(string $title): string` — транслитерация + slugify (`cocur/slugify`)
- CI Command `php spark locations:generate-slugs` — разовое заполнение существующих записей
- Дополнить геокодирующий скрипт: при создании новой локации сразу генерировать `slug` и `name_prepositional_ru`

**Новые и обновлённые API-эндпоинты:**

| Эндпоинт | Назначение |
|---|---|
| `GET /locations/resolve?slug=orenburg` | Резолв slug → `{id, type, name_ru, name_en, name_prepositional_ru, slug}` |
| `GET /places?locality_slug=orenburg&category=abandoned` | Фильтрация по slug вместо ID |
| `GET /locations/{id}/categories` | Категории с count для блока "Категории в городе" |
| `GET /locations/{id}/nearby` | Соседние города того же региона для блока перелинковки |
| `GET /categories/{name}/localities` | Топ городов по категории для блока "По городам" |

### Клиент (Next.js)

- `pages/places/[location].tsx` — обрабатывает `/places/[category]` и `/places/[location-slug]`
- `pages/places/[location]/[category].tsx` — локация + категория
- Оба файла используют общий компонент `PlacesListPage` (~90% общего кода)
- Фильтр на `/places` делает `router.push()` на соответствующий SEO-URL
- 301-редиректы из `/places?locality=1` → `/places/orenburg` через `middleware.ts` или `next.config.js`
- Обновить компонент адреса на карточке/детальной странице — ссылки вести на новые SEO-URL
- Обновить `sitemap.tsx` — включить все локации и комбинации с категориями
- SSR (`getServerSideProps`) для всех SEO-страниц — контент динамический, счётчики меняются

---

## Приоритет реализации

1. **БД-миграции** — поля `slug`, `name_prepositional_ru` в таблицах локаций; `title_adj_ru/en` в категориях
2. **CI Command** `locations:generate-slugs` — заполнить существующие записи через `morphos`
3. **Геокодирующий скрипт** — дополнить генерацией slug + morphos для новых локаций
4. **API** — эндпоинты resolve, categories/nearby/localities (см. таблицу выше)
5. **Страницы** — `pages/places/[location].tsx` и `pages/places/[location]/[category].tsx`
6. **Общий компонент** `PlacesListPage` — рефакторинг текущей `/places` + новые SEO-блоки
7. **Фильтр → router.push()** — обновить логику фильтрации на `/places`
8. **Title/description** — i18n-шаблоны + подключить `name_prepositional_ru` и `title_adj`
9. **Breadcrumbs + JSON-LD** — на SEO-страницах и детальных страницах мест
10. **Ссылки адреса** на детальной странице места — обновить на новые SEO-URL
11. **301-редиректы** — `/places?locality=1` → `/places/orenburg` через middleware
12. **Sitemap** — включить локации, категории и комбинации
13. **Внутренняя перелинковка** — блоки "Другие города", "Похожие категории", "Рядом"

---

## Открытые вопросы

- **og:image** — генерация превью через Mapbox Static API (статическая карта с точками мест)
