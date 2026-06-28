# Phase 3 — Категории и теги

## Цель

Переработать систему категорий: сократить и упростить. Добавить теги как второй уровень классификации — для точного описания мест без перегрузки категорий.

---

## Проблемы текущих категорий

- 21 категория, многие пересекаются (`memorial` + `monument`, `castle` + `manor`, `battlefield` + `military`)
- Слабые URL-слаги для SEO (`battlefield`, `transport` — никто не ищет по-русски)
- Некоторые не соответствуют концепции (`camping` — сервис, не интересное место)
- Нет catch-all для необычных объектов (дерево в форме буквы W — куда?)

---

## Новые категории (14 вместо 21)

| `name` (slug) | Название RU | Что включает | Было |
|---|---|---|---|
| `abandoned` | Заброшенное | Без изменений | `abandoned` |
| `military` | Военный объект | Бункеры + места сражений | `military` + `battlefield` |
| `historical` | Историческое место | Крепости, усадьбы, памятники | `castle` + `manor` + `memorial` + `monument` |
| `religious` | Религиозное | Без изменений | `religious` |
| `museum` | Музей | Без изменений | `museum` |
| `archeology` | Археология | Без изменений | `archeology` |
| `engineering` | Инженерное сооружение | Заводы, шахты, техника, маяки | `factory` + `mine` + `transport` + `construction` |
| `cave` | Пещера | Без изменений | `cave` |
| `waterfall` | Водопад | Без изменений | `waterfall` |
| `water` | Водоём | Без изменений | `water` |
| `mountain` | Гора и скалы | + родники как природный объект | `mountain` + `spring` |
| `nature` | Природный объект | Долины, ущелья, общий природный catch-all | `nature` |
| `viewpoint` | Смотровая площадка | **Новая** — высокий поисковый спрос | — |
| `unusual` | Необычное место | **Новая** — всё нестандартное | — |

**Убираем:** `battlefield`, `transport`, `mine`, `factory`, `construction`, `memorial`, `monument`, `castle`, `manor`, `spring`, `camping`

---

## SEO-безопасная миграция

**Правило: URL с трафиком не умирает — только редиректит.**

301-редиректы со старых URL на новые:

```
/categories/battlefield  → /categories/military
/categories/monument     → /categories/historical
/categories/memorial     → /categories/historical
/categories/castle       → /categories/historical
/categories/manor        → /categories/historical
/categories/mine         → /categories/engineering
/categories/factory      → /categories/engineering
/categories/transport    → /categories/engineering
/categories/construction → /categories/engineering
/categories/spring       → /categories/mountain
/categories/camping      → /categories/nature
```

**В базе данных:** не удалять старые категории — добавить поле `redirect_to` (slug новой категории). Старая категория помечается как устаревшая, фронт читает `redirect_to` и отдаёт 301.

**Места:** автоматически переназначить на новую категорию при миграции (по таблице выше).

---

## Система тегов

Теги — второй уровень описания места. Категория отвечает на "что это?", тег — "чем примечательно?".

**Пример:**
```
Место:      Тиски смерти (ковш в Припяти)
Категория:  Заброшенное
Теги:       Чернобыль, Радиоактивное, Техника, Зона отчуждения, Украина
```

**Правила тегов:**
- Добавляет любой зарегистрированный пользователь
- Максимум 10 тегов на место
- Свободный ввод + автодополнение из существующих тегов
- Теги нормализуются (lowercase, trim)

**SEO-потенциал тегов:**
Популярные теги → отдельные страницы `/tags/chernobyl`, `/tags/abandoned-ussr` → дополнительный трафик по уникальным запросам.

---

## Технические задачи

- [ ] Добавить поле `redirect_to` в таблицу `categories`
- [ ] Миграция: переназначить места по таблице выше
- [ ] Настроить 301-редиректы на фронте (Next.js `redirects` в `next.config.js`)
- [ ] Создать таблицу `tags` и `place_tags` (many-to-many)
- [ ] UI: поле тегов на странице создания/редактирования места
- [ ] Страницы тегов `/tags/:slug`
- [ ] Обновить фильтры на `/places`
