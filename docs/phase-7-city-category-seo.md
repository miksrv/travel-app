# Phase 7 — City/Category SEO лендинги

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

В проекте уже есть скрипт, который при создании или редактировании места получает адрес и заполняет таблицы локаций. Этот скрипт нужно дополнить: если запись локации создаётся впервые — сразу генерировать и сохранять `slug` и `name_prepositional_ru`.

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

PHP **не генерирует готовый заголовок** — он возвращает морфологические формы как поля данных. Сборка строки — задача Next.js, потому что шаблоны принадлежат i18n-слою (`public/locales/`).

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

**Результаты:**

```
/places/orenburg             → "Интересные места в Оренбурге"
/places/orenburg-oblast      → "Интересные места в Оренбургской области"
/places/russia               → "Интересные места в России"
/places/abandoned            → "Заброшенные места"
/places/orenburg/abandoned   → "Заброшенные места в Оренбурге"
```

### description (отдельно от title, содержит count)

```
/places/orenburg           → "Найдено 87 мест в Оренбурге. Карта, фото, описания."
/places/orenburg/abandoned → "87 заброшенных мест в Оренбурге с фото и описаниями."
```

Морфология через `wapmorph/morphos` (PHP, локальная, без внешних запросов).

---

## Breadcrumbs (UI + schema.org)

### Детальная страница места

Обновить ссылки адреса — с `/places?locality=1` на `/places/stavropol-krai`, `/places/lermontov`.
Добавить schema.org `BreadcrumbList` в JSON-LD:

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

---

## Структура страниц (UI)

### `/places/orenburg`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Оренбургская обл. / Оренбург   │
├─────────────────────────────────────────────────────┤
│  H1: Интересные места в Оренбурге  (87 мест)        │
├──────────────┬──────────────────────────────────────┤
│  Мини-карта  │  Категории в Оренбурге:              │
│  с кластерами│  Заброшенные (12) · Природа (8) ...  │
│  мест        │  (ссылки → /places/orenburg/[cat])   │
│              ├──────────────────────────────────────┤
│              │  Сетка карточек мест                 │
├──────────────┴──────────────────────────────────────┤
│  Другие города Оренбургской области:                │
│  Орск · Бузулук · Новотроицк                        │
└─────────────────────────────────────────────────────┘
```

### `/places/abandoned`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Заброшенные                    │
├─────────────────────────────────────────────────────┤
│  H1: Заброшенные места  (342 места)                 │
│  [текст из category.content — описание категории]   │
├─────────────────────────────────────────────────────┤
│  Заброшенные места по городам:                      │
│  Оренбург (12) · Ставрополь (9) · Краснодар (7)... │
├─────────────────────────────────────────────────────┤
│  Сетка карточек мест                                │
├─────────────────────────────────────────────────────┤
│  Похожие категории: Военные объекты · Шахты         │
└─────────────────────────────────────────────────────┘
```

Мини-карта здесь **не нужна** — точки разбросаны по всей России.

### `/places/orenburg/abandoned`

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: Места / Оренбург / Заброшенные         │
├─────────────────────────────────────────────────────┤
│  H1: Заброшенные места в Оренбурге  (12 мест)       │
├──────────────┬──────────────────────────────────────┤
│  Мини-карта  │  Сетка карточек мест                 │
│  (заброшенные│                                      │
│  в Оренбурге)│                                      │
├──────────────┴──────────────────────────────────────┤
│  Другие категории в Оренбурге:                      │
│  Природа (8) · Религиозные (5) · Памятники (4)     │
├─────────────────────────────────────────────────────┤
│  Заброшенные места рядом:                           │
│  Орск (7) · Бузулук (3) · Оренбургская обл. (34)   │
└─────────────────────────────────────────────────────┘
```

---

## Взаимодействие фильтров и SEO-URL

Один React-компонент для всех трёх URL. При выборе фильтра — `router.push()` на SEO-URL:

```
Выбрал "Оренбург":          /places → /places/orenburg
Выбрал "Заброшенные":       /places/orenburg → /places/orenburg/abandoned
Снял локацию:               /places/orenburg/abandoned → /places/abandoned
Сбросил всё:                /places/abandoned → /places
```

### Редиректы со старых query-param URL

```
/places?locality=1                       → 301 → /places/orenburg
/places?locality=1&category=abandoned    → 301 → /places/orenburg/abandoned
/places?category=abandoned               → 301 → /places/abandoned
```

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

---

## Технические задачи

### БД
- [ ] `ALTER TABLE location_localities ADD COLUMN slug VARCHAR(120) UNIQUE`
- [ ] `ALTER TABLE location_localities ADD COLUMN name_prepositional_ru VARCHAR(120)`
- [ ] То же для `location_regions` и `location_countries`
- [ ] `ALTER TABLE category ADD COLUMN title_adj_ru VARCHAR(100)` — "Заброшенные"
- [ ] `ALTER TABLE category ADD COLUMN title_adj_en VARCHAR(100)` — "Abandoned"

### Backend
- [ ] `php spark locations:generate-slugs` — разовая миграция
- [ ] Дополнить геокодирующий скрипт: генерировать slug + морфологию при создании новой локации
- [ ] `GET /locations/resolve?slug=orenburg`
- [ ] `GET /places?locality_slug=orenburg&category=abandoned`
- [ ] `GET /locations/{id}/categories` — категории с count
- [ ] `GET /locations/{id}/nearby` — соседние города региона
- [ ] `GET /categories/{name}/localities` — топ городов по категории

### Frontend
- [ ] `pages/places/[location].tsx` — категория или локация
- [ ] `pages/places/[location]/[category].tsx` — локация + категория
- [ ] Общий компонент `PlacesListPage` (рефакторинг текущей `/places`)
- [ ] Фильтр → `router.push()` на SEO-URL
- [ ] 301-редиректы из query-param URL через `middleware.ts`
- [ ] Обновить ссылки адреса на карточках и детальных страницах
- [ ] Обновить `sitemap.tsx` — включить локации и комбинации
- [ ] BreadcrumbList JSON-LD на SEO-страницах и страницах мест
- [ ] i18n-шаблоны title/description (`seo-places-locality`, `seo-places-category-locality`)

### Открытые вопросы
- `og:image` — генерация превью через Mapbox Static API (статическая карта с точками мест)
