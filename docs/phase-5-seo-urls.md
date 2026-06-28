# Phase 5 — SEO-friendly URL для мест

## Цель

Добавить читаемый slug к URL страниц мест для улучшения CTR в поиске и SEO-веса страниц.

**Было:** `https://geometki.com/places/65cfaafd603ca`
**Стало:** `https://geometki.com/places/65cfaafd603ca_zabroshennyy-detskiy-lager-vostok-6`

Паттерн используют Stack Overflow, Wikipedia, Reddit, YouTube — ID для однозначности, slug для SEO и читаемости.

---

## Принцип работы

- В URL всегда хранится `{id}_{slug}`
- При обращении к странице читается **только часть до `_`** — это ID
- Slug декоративный: даже если он устарел или отсутствует — страница найдётся по ID
- Если URL не содержит slug или slug не совпадает с актуальным — **301 редирект** на канонический URL

```
/places/65cfaafd603ca                              → 301 → /places/65cfaafd603ca_vostok-6
/places/65cfaafd603ca_старый-заголовок             → 301 → /places/65cfaafd603ca_novyy-zagolovok
/places/65cfaafd603ca_zabroshennyy-lager-vostok-6  → 200 OK
```

---

## Backend (CodeIgniter 4)

### 1. Новое поле в таблице `places`

Миграция: добавить поле `slug VARCHAR(200) NULL` в таблицу `places`.

### 2. Генерация slug

Slug генерируется из `title` места при создании и при изменении заголовка:

```
"Заброшенный детский лагерь «Восток-6»"
→ транслитерация: "Zabroshennyy detskiy lager Vostok-6"
→ lowercase + замена пробелов/спецсимволов на "-"
→ "zabroshennyy-detskiy-lager-vostok-6"
→ обрезать до 80 символов
```

Транслитерация: использовать стандартную таблицу ГОСТ или библиотеку `behat/transliterator`.

### 3. CLI-команда для генерации slug существующих мест

```bash
php spark places:generate-slugs
```

Команда:
1. Выбирает все места где `slug IS NULL`
2. Генерирует slug из `title`
3. Сохраняет в базу
4. Выводит прогресс и количество обработанных записей

### 4. Роут

Текущий роут принимает любую строку как `id` — изменений в роутинге не требуется. Backend читает `id` из запроса, игнорируя `_slug` часть.

---

## Frontend (Next.js)

### 1. Парсинг ID из параметра — `pages/places/[id]/index.tsx`

**Строка 354** — изменить извлечение ID:

```typescript
// Было:
const id = typeof context.params?.id === 'string' ? context.params.id : undefined

// Стало:
const rawParam = typeof context.params?.id === 'string' ? context.params.id : undefined
const id = rawParam?.split('_')[0]
```

### 2. Редирект на канонический URL

После получения `place` из API — проверить соответствие slug в URL:

```typescript
const expectedParam = `${place.id}_${place.slug}`
if (rawParam !== expectedParam) {
    return {
        redirect: {
            destination: `/places/${expectedParam}`,
            permanent: true  // 301
        }
    }
}
```

### 3. Генерация ссылок на места

Везде где генерируются ссылки `/places/${place.id}` — заменить на `/places/${place.id}_${place.slug}`.

Создать хелпер `placeUrl(place)` для единообразия:

```typescript
// functions/helpers.ts
export const placeUrl = (place: { id: string; slug?: string }) =>
    `/places/${place.id}${place.slug ? `_${place.slug}` : ''}`
```

### 4. Обновить canonical и hreflang теги

```typescript
// Строка 78 — было:
const pagePlaceUrl = `${canonicalUrl}places/${place?.id}`

// Стало:
const pagePlaceUrl = `${canonicalUrl}places/${place?.id}_${place?.slug}`
```

---

## SEO-безопасность

- Старые URL вида `/places/65cfaafd603ca` **продолжают работать** — 301 редиректят на новый формат
- Поисковик получает 301 → обновляет индекс на новый URL, передаёт PageRank
- Ни одна проиндексированная страница не станет 404

---

## Расширение на другие сущности

По той же схеме можно добавить slug для:
- `/users/{id}_{username}` — пользователи
- `/collections/{id}_{slug}` — коллекции (Phase будущая)

---

## Технические задачи

- [ ] Миграция БД: добавить поле `slug` в таблицу `places`
- [ ] Backend: генерация slug при create/update title
- [ ] Backend: CLI-команда `php spark places:generate-slugs`
- [ ] Frontend: парсинг ID из `{id}_{slug}` параметра
- [ ] Frontend: 301 редирект если URL не совпадает с актуальным slug
- [ ] Frontend: хелпер `placeUrl()`, обновить все ссылки на места
- [ ] Frontend: обновить canonical и hreflang теги
