# Phase 11 — Редизайн системы активности

## Проблема текущей системы

Каждое действие пользователя создаёт отдельный элемент в ленте. Пользователь меняет категорию, загружает 2 фото — в ленте 3 строки вместо одной. Лента засоряется техническим шумом вместо того чтобы рассказывать историю.

---

## Цель

**Хранить гранулярно — показывать агрегированно.**

```
Было (3 элемента ленты):
  Иван изменил категорию «Заброшенный лагерь»
  Иван загрузил фото в «Заброшенный лагерь»
  Иван загрузил фото в «Заброшенный лагерь»

Стало (1 элемент):
  Иван изменил категорию и загрузил 2 фотографии для «Заброшенный лагерь»
```

---

## Архитектура БД

### Таблица `activity_events` — гранулярный лог всех событий

```sql
CREATE TABLE activity_events (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NULL,          -- NULL = гость
    guest_hash    VARCHAR(64) NULL,           -- хэш IP+UA для гостей
    entity_type   ENUM('place','user','collection') NOT NULL,
    entity_id     VARCHAR(32) NOT NULL,
    action        VARCHAR(64) NOT NULL,       -- см. типы ниже
    payload       JSON NULL,                  -- доп. данные (count, value, old/new)
    is_public     TINYINT(1) NOT NULL DEFAULT 1, -- 0 = только XP, в ленту не попадает
    session_key   VARCHAR(96) NOT NULL,       -- hash(user_id|guest_hash + entity_id + 30min_bucket)
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_session (session_key),
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_entity (entity_type, entity_id)
);
```

### Таблица `activity_feed` — агрегированная лента (pre-computed)

```sql
CREATE TABLE activity_feed (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NULL,
    guest_hash    VARCHAR(64) NULL,
    entity_type   ENUM('place','user','collection') NOT NULL,
    entity_id     VARCHAR(32) NOT NULL,
    entity_title  VARCHAR(255) NULL,          -- snapshot названия (денормализация для скорости)
    actions       JSON NOT NULL,              -- агрегированные действия, см. формат ниже
    first_at      TIMESTAMP NOT NULL,
    last_at       TIMESTAMP NOT NULL,
    session_key   VARCHAR(96) NOT NULL UNIQUE,

    INDEX idx_last_at (last_at DESC),
    INDEX idx_user (user_id, last_at DESC)
);
```

**Формат поля `actions`:**
```json
[
  { "action": "category_changed", "count": 1 },
  { "action": "photo_uploaded",   "count": 2 },
  { "action": "description_edited","count": 1 }
]
```

---

## Типы событий

### Публичные — показываются в ленте `/activity`

#### Одиночные (не группируются — всегда отдельный элемент ленты)

| `action` | Пример текста |
|----------|--------------|
| `place_created` | Иван **добавил** место «Заброшенный лагерь» |
| `place_visited` | Иван **побывал** в «Заброшенный лагерь» |
| `rating_given` | Иван **оценил** «Заброшенный лагерь» на ⭐ 5 |
| `achievement_unlocked` | Иван **получил** достижение «Первооткрыватель» |
| `comment_added` | Иван **написал отзыв** о «Заброшенный лагерь» |

#### Группируемые (объединяются в одну запись по session_key)

| `action` | payload | Пример текста (в составе группы) |
|----------|---------|----------------------------------|
| `photo_uploaded` | `{"count": N}` | загрузил N фотографий |
| `cover_changed` | — | обновил обложку |
| `category_changed` | `{"old": "...", "new": "..."}` | изменил категорию |
| `description_edited` | — | отредактировал описание |
| `title_edited` | `{"old": "...", "new": "..."}` | изменил название |

### Только XP — логируются, но в ленте не показываются

| `action` | За что начисляется XP |
|----------|-----------------------|
| `bookmark_added` | Пользователь добавил место в закладки |
| `coordinates_updated` | Уточнил координаты места |
| `tags_updated` | Обновил теги места |
| `attributes_updated` | Заполнил атрибуты места |

Эти события пишутся в `activity_events` с флагом `is_public = false`. В `activity_feed` не попадают. XP и достижения начисляются как обычно.

### Будущие (после Phase 9-10)

| `action` | Тип | Пример текста |
|----------|-----|--------------|
| `collection_created` | Публичное, одиночное | Иван **создал коллекцию** «Заброшки Оренбурга» |
| `collection_place_added` | Публичное, группируемое | добавил N мест в коллекцию |
| `route_created` | Публичное, одиночное | Иван **создал маршрут** «По заброшкам Урала» |

---

## Окно группировки (session_key)

```
session_key = sha1( (user_id ?? guest_hash) + ':' + entity_id + ':' + floor(unix_timestamp / 1800) )
```

**1800 секунд = 30 минут.** Одно и то же действие пользователя на одном месте в рамках 30 минут → одна запись в ленте.

Примеры:
- Загрузил фото в 14:05 и ещё одно в 14:20 → одна запись: "загрузил 2 фотографии"
- Загрузил фото в 14:05 и ещё одно в 14:35 → две отдельные записи (разные 30-мин окна)

---

## Генерация текста

### Принцип: backend возвращает данные, frontend собирает текст

PHP возвращает структурированные данные. Next.js собирает строку через i18n-шаблоны. Это позволяет менять формулировки без деплоя бэкенда.

**Что возвращает API:**
```json
{
  "user": { "name": "Иван", "gender": "m" },
  "entity": { "type": "place", "id": "...", "title": "Заброшенный лагерь" },
  "actions": [
    { "action": "category_changed", "count": 1 },
    { "action": "photo_uploaded", "count": 2 }
  ],
  "last_at": "2026-05-27T14:22:00Z"
}
```

### Гендер глаголов

Хранить `gender ENUM('m','f') NULL` в таблице `users`. Если не заполнен — использовать мужской род (статистически чаще, нейтрально воспринимается).

| action | m | f |
|--------|---|---|
| place_created | добавил место | добавила место |
| place_visited | побывал в | побывала в |
| photo_uploaded | загрузил | загрузила |
| description_edited | отредактировал описание | отредактировала описание |
| rating_given | оценил | оценила |
| comment_added | написал отзыв | написала отзыв |

### Правила сборки текста из нескольких action

```
1 действие:
  "Иван загрузил 3 фотографии для «Лагерь»"

2 действия:
  "Иван изменил категорию и загрузил 2 фотографии для «Лагерь»"

3+ действия:
  "Иван отредактировал описание, обновил обложку и загрузил 3 фотографии для «Лагерь»"
  (последнее через "и", остальные через запятую)
```

### Специальные случаи

**Гость:**
```
"Гость оценил «Заброшенный лагерь» на ⭐ 5"
"Гость написал отзыв о «Заброшенный лагерь»"
```

**Счётчик фотографий:**
```
1 → фотографию
2-4 → фотографии
5+ → фотографий
```

---

## Фоновый агрегатор

Фоновый процесс (CI4 Command или cron) запускается каждые **5 минут**:

1. Берёт новые записи из `activity_events` за последние 35 минут (с перекрытием)
2. Группирует по `session_key`
3. Обновляет/создаёт записи в `activity_feed` (upsert по `session_key`)
4. Итог: лента всегда актуальна с задержкой ≤5 минут

Альтернатива: обновлять `activity_feed` синхронно при записи события (проще, но немного медленнее при write-heavy нагрузке). При текущем трафике — приемлемо.

---

## UI ленты

### Элемент ленты

```
[Аватар] Иван                                       14:22
         изменил категорию и загрузил 2 фотографии
         для «Заброшенный детский лагерь»
         [превью фото] [превью фото]
```

### Группируем ли по дате в UI?

Да — разделители "Сегодня", "Вчера", "27 мая" между блоками дней.

### Лента на главной vs полная лента `/activity`

- **Главная**: последние 5-7 элементов, без пагинации
- `/activity`: полная лента, пагинация или infinite scroll, фильтр по типу действия

---

## Каскадное удаление и целостность данных

### Почему старый подход не работает в новом дизайне

В старой таблице `activity` все связи были прямыми FK-колонками — MySQL автоматически каскадировал удаления:

```
place удалён → activity WHERE place_id = X → удалено (CASCADE)
rating удалён → activity WHERE rating_id = X → удалено (CASCADE)
comment удалён → activity WHERE comment_id = X → удалено (CASCADE)
photo удалён → activity WHERE photo_id = X → удалено (CASCADE)
user удалён → activity WHERE user_id = X → удалено (CASCADE)
```

В новых таблицах:
- `entity_id` — **полиморфный** (может быть place, collection, user) → FK невозможен
- `photo_id`, `rating_id`, `comment_id` → уехали в **JSON `payload`** → FK невозможен совсем

Решение: **гибридный подход** — FK там где возможно, приложение везде остальное.

---

### FK-ограничения (что можно сделать на уровне БД)

`user_id` остаётся прямой колонкой в обеих таблицах — FK работает как раньше:

```sql
ALTER TABLE activity_events
    ADD CONSTRAINT fk_ae_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE activity_feed
    ADD CONSTRAINT fk_af_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

Удалён пользователь → все его события и feed-записи удалены автоматически. ✓

---

### Приложение-уровень: cleanup-методы в ActivityLibrary

Для всего остального — явные методы очистки, вызываемые из контроллеров при удалении сущностей.

```php
class ActivityLibrary {
    // Вызывается из Places::delete()
    public function cleanupByPlace(string $placeId): void
    {
        $db = db_connect();
        $db->table('activity_events')
           ->where('entity_type', 'place')
           ->where('entity_id', $placeId)
           ->delete();
        $db->table('activity_feed')
           ->where('entity_type', 'place')
           ->where('entity_id', $placeId)
           ->delete();
    }

    // Вызывается из Rating::delete()
    public function cleanupByRating(string $ratingId): void
    {
        $db = db_connect();
        // Удаляем events с этим rating_id в payload
        $db->query(
            "DELETE FROM activity_events
             WHERE action = 'rating_given'
             AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.rating_id')) = ?",
            [$ratingId]
        );
        // Feed-записи с только этим действием — удалить; с несколькими — перегенерировать
        $this->_cleanupOrphanedFeed();
    }

    // Вызывается из Comments::delete()
    public function cleanupByComment(string $commentId): void
    {
        $db = db_connect();
        $db->query(
            "DELETE FROM activity_events
             WHERE action = 'comment_added'
             AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.comment_id')) = ?",
            [$commentId]
        );
        $this->_cleanupOrphanedFeed();
    }

    // Вызывается из Photos::delete()
    public function cleanupByPhoto(string $photoId): void
    {
        $db = db_connect();
        $db->query(
            "DELETE FROM activity_events
             WHERE action = 'photo_uploaded'
             AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.photo_id')) = ?",
            [$photoId]
        );
        $this->_cleanupOrphanedFeed();
    }

    // Удаляет feed-записи у которых не осталось events
    private function _cleanupOrphanedFeed(): void
    {
        db_connect()->query(
            "DELETE af FROM activity_feed af
             WHERE NOT EXISTS (
                 SELECT 1 FROM activity_events ae
                 WHERE ae.session_key = af.session_key
             )"
        );
    }
}
```

### Где вызываются cleanup-методы

| Контроллер | Метод удаления | Вызов |
|---|---|---|
| `Places::delete()` | удаление места (soft или hard) | `cleanupByPlace($placeId)` |
| `Rating::delete()` | удаление оценки | `cleanupByRating($ratingId)` |
| `Comments::delete()` | удаление комментария | `cleanupByComment($commentId)` |
| `Photos::delete()` | удаление фото | `cleanupByPhoto($photoId)` |

> **Soft delete**: `places` использует `deleted_at`. При установке `deleted_at` — тоже вызывать `cleanupByPlace()`. Место "удалено" для пользователей = его активность не должна светиться в ленте.

### Страховка: ночной cleanup-job

На случай если cleanup-вызов не сработал (исключение, прямой запрос в БД, будущий баг):

```bash
# В cron — раз в сутки
php spark activity:cleanup-orphans
```

Команда удаляет `activity_feed` записи где `entity_id` уже не существует в соответствующей таблице.

---

## Миграция существующих данных

### Что есть сейчас

Таблица `activity` со структурой:
```
id, type ENUM('photo','place','rating','edit','cover','comment','visit'),
views, session_id (FK→sessions, для гостей), user_id,
photo_id, place_id, rating_id, comment_id,
created_at, updated_at, deleted_at
```

Проблема типа `edit` — он один на все виды редактирования (описание, категория, название, координаты). При миграции не узнаем, что именно было отредактировано. Мигрируем как `description_edited` с пометкой в payload.

### Маппинг старых типов на новые action

| Старый `type` | Новый `action` | payload |
|---|---|---|
| `place` | `place_created` | — |
| `photo` | `photo_uploaded` | `{"photo_id": "..."}` |
| `rating` | `rating_given` | `{"rating_id": "...", "value": N}` — значение брать из таблицы `rating` |
| `edit` | `description_edited` | `{"legacy": true}` — не знаем что редактировалось |
| `cover` | `cover_changed` | — |
| `comment` | `comment_added` | `{"comment_id": "..."}` |
| `visit` | `place_visited` | — |

Поле `session_id` (FK → sessions) → `guest_hash`: для гостей берём значение `session_id` как есть и пишем в `guest_hash`. FK на `sessions` убираем — в новой таблице это просто строка-идентификатор.

### Шаги миграции

**Шаг 1 — Создать новые таблицы**
Запустить миграцию БД: создать `activity_events` и `activity_feed`. Старая таблица `activity` не трогается.

**Шаг 2 — Перенести исторические данные**

```bash
php spark activity:migrate-legacy
```

Команда:
1. Читает все записи из `activity` (батчами по 500), `deleted_at IS NULL`
2. Для каждой создаёт запись в `activity_events` по маппингу выше
3. Для `rating_given` делает JOIN с таблицей `rating` чтобы достать числовое значение оценки
4. Генерирует `session_key` из `(user_id ?? session_id) + ':' + place_id + ':' + floor(unix_ts / 1800)`
5. Пропускает записи без `place_id` (если такие есть)
6. Выводит прогресс и итог
7. Поддерживает `--dry-run`

**Шаг 3 — Построить первоначальный `activity_feed`**

```bash
php spark activity:aggregate --full
```

Флаг `--full` — прогнать по всей истории, не только последние 35 минут. Строит агрегированную ленту из только что перенесённых событий.

**Шаг 4 — Переключить запись**

Обновить `ActivityLibrary` — при вызове `.photo()`, `.place()`, `.edit()` и т.д. писать в `activity_events` вместо `activity`. API `/activity` переключить на чтение из `activity_feed`.

**Шаг 5 — Параллельная запись (страховка)**

В течение **2 недель** после переключения писать в обе таблицы одновременно — и в старую `activity`, и в новую `activity_events`. Это позволяет быстро откатиться если что-то пойдёт не так. Читать только из новой.

**Шаг 6 — Удалить старую таблицу**

Через 2 недели после переключения, убедившись что лента работает корректно:
```bash
php spark migration:run  # миграция дропает таблицу activity
```

### Что остаётся неизменным

Логика XP, достижений и email-уведомлений **не трогается** в рамках этой фазы — она по-прежнему запускается из `ActivityLibrary`. Просто `_add()` внутри начнёт писать в `activity_events` вместо `activity`. Вся обвязка (`LevelsLibrary`, `AchievementsLibrary`, `NotifyLibrary`) остаётся как есть.

### Риски и откат

| Риск | Митигация |
|------|-----------|
| Агрегатор не успевает — лента пустая | Параллельная запись + старый fallback API на 2 недели |
| Неправильный текст из-за `legacy: true` | Показывать generic: "отредактировал место" — не страшно |
| Потеря записей при миграции | `--dry-run` перед боевым запуском, сверка COUNT(*) |
| Разные значения `rating` в payload | JOIN при миграции обязателен, без него значение = null |

---

## Технические задачи

### Backend
- [ ] Создать таблицу `activity_events`
- [ ] Создать таблицу `activity_feed`
- [ ] Добавить поле `gender` в таблицу `users`
- [ ] Реализовать запись событий во всех точках (create/update/photo/rating/etc.)
- [ ] Фоновый агрегатор: `php spark activity:aggregate`
- [ ] API: `GET /activity` — возвращает агрегированную ленту с пагинацией
- [ ] API: `GET /activity?user_id=X` — лента конкретного пользователя
- [ ] Мигрировать/удалить старую таблицу активности

### Frontend
- [ ] Обновить компонент `ActivityList` — рендер из новой структуры
- [ ] i18n-шаблоны для всех типов действий (ru + заморожен en)
- [ ] Функция сборки текста из массива `actions` с учётом гендера
- [ ] Функция склонения числительных для фото (1/2-4/5+)
- [ ] Разделители по датам в ленте
