# Phase 12 — Система опыта (XP)

## Цель

Формализовать: за что начисляется опыт, сколько, как хранится и как пересчитывается. Геймификация работает только если правила понятны и честны.

---

## Архитектура хранения

### Два уровня

| Уровень | Где | Зачем |
|---|---|---|
| Кэш | `users.xp` + `users.level` | Быстрое отображение в UI без агрегации |
| Источник правды | `activity_events` | Пересчёт при изменении правил, аудит, защита от накруток |

### Принцип

`users.xp` — денормализованное поле, обновляется при каждом начислении. При любом сомнении (`activity_events` ≠ `users.xp`) — `activity_events` выигрывает.

Уровень (`users.level`) вычисляется из `users.xp` по таблице порогов — при пересчёте обновляется автоматически.

---

## Начисление XP

XP начисляется синхронно при записи события в `activity_events`, внутри `ActivityLibrary` (или отдельного `XpLibrary`). Атомарно: `UPDATE users SET xp = xp + :amount WHERE id = :user_id`.

---

## Таблица начисления XP

Текущие ставки зафиксированы в `app/Config/Constants.php` как `MODIFIER_*`. В Phase 12 ставки переносятся в отдельный конфиг и расширяются новыми типами событий.

### Контент

| Событие (`event_type`) | XP | Константа | Лимит |
|---|---|---|---|
| `place_created` | 20 | `MODIFIER_PLACE` | — |
| `photo_uploaded` | 10 | `MODIFIER_PHOTO` | 10 фото в сутки (100 XP/день) |
| `cover_changed` | 2 | `MODIFIER_COVER` | — |
| `description_edited` | 5 | `MODIFIER_EDIT` | 1 раз за правку (не за символ) |
| `title_edited` | 5 | — | 1 раз за правку |
| `category_changed` | 5 | — | 1 раз за правку |
| `tags_updated` | 3 | — | 1 раз за правку |
| `attributes_updated` | 5 | — | 1 раз за правку |
| `coordinates_updated` | 5 | — | — |

### Социальное

| Событие (`event_type`) | XP | Константа | Лимит |
|---|---|---|---|
| `comment_added` | 5 | `MODIFIER_COMMENT` | 10 комментариев в сутки (50 XP/день) |
| `rating_given` | 1 | `MODIFIER_RATING` | 1 раз на место |
| `place_visited` | 2 | — | 1 раз на место (не повторно) |
| `bookmark_added` | 1 | — | 1 раз на место |

### Достижения

| Событие (`event_type`) | XP | Лимит |
|---|---|---|
| `achievement_unlocked` | Берётся из поля `achievements.xp_bonus` | — |

---

## Защита от накруток

**Суточные лимиты (per user):**
- Фото: не более 10 фото в сутки дают XP (100 XP/день)
- Комментарии: не более 10 в сутки дают XP (50 XP/день)
- Редактирование одного и того же места: одно и то же поле одного места — не чаще раза в час

**Системные проверки:**
- `place_visited` для своего места → XP не начисляется
- `rating_given` для своего места → XP не начисляется
- `bookmark_added` для своего места → XP не начисляется

Эти правила прописаны в `XpLibrary::shouldAward()` и проверяются до записи в `activity_events`.

---

## Пороги уровней

Хранятся в `app/Config/Levels.php` → `$levels[]`. Максимальный уровень — 30.

| Уровень | XP (min) | Уровень | XP (min) | Уровень | XP (min) |
|---|---|---|---|---|---|
| 1 | 0 | 11 | 2 800 | 21 | 17 200 |
| 2 | 75 | 12 | 3 500 | 22 | 19 600 |
| 3 | 150 | 13 | 4 400 | 23 | 22 200 |
| 4 | 300 | 14 | 5 400 | 24 | 25 000 |
| 5 | 500 | 15 | 6 600 | 25 | 28 000 |
| 6 | 750 | 16 | 8 000 | 26 | 31 500 |
| 7 | 1 000 | 17 | 9 500 | 27 | 35 000 |
| 8 | 1 350 | 18 | 11 200 | 28 | 39 000 |
| 9 | 1 750 | 19 | 13 000 | 29 | 43 000 |
| 10 | 2 200 | 20 | 15 000 | 30 | 47 500 |

Пороги меняются только в `Config/Levels.php` — после изменения запустить `php spark xp:recalculate-levels`.

---

## Схема БД

### Таблица `users`

Поля `experience` и `level` уже существуют. Миграции не требуется.

### Таблица `xp_transactions` *(опционально, для аудита)*

Если нужна история начислений отдельно от `activity_events`:

```sql
CREATE TABLE xp_transactions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    amount      SMALLINT NOT NULL,          -- может быть отрицательным при пересчёте
    reason      VARCHAR(50) NOT NULL,       -- event_type или 'recalculate'
    event_id    BIGINT UNSIGNED NULL,       -- FK → activity_events.id (NULL при пересчёте)
    created_at  DATETIME NOT NULL,
    INDEX idx_user (user_id),
    CONSTRAINT fk_xp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

На первом этапе можно обойтись без этой таблицы — `activity_events` достаточно.

---

## CLI-команды

### Пересчёт XP пользователя

```bash
php spark xp:recalculate
php spark xp:recalculate --user-id=42
```

Алгоритм:
1. Для каждого пользователя (или конкретного): выбрать все `activity_events` с `is_public=1` или XP-событиями
2. Применить текущую таблицу начисления + лимиты
3. Просуммировать → записать в `users.xp`
4. Пересчитать `users.level` по порогам
5. Вывести статистику: сколько пользователей обработано, суммарный XP до/после

### Пересчёт уровней

```bash
php spark xp:recalculate-levels
```

Используется когда меняются только пороги уровней (без пересчёта XP).

---

## Интеграция с ActivityLibrary

После записи события в `activity_events`:

```php
// ActivityLibrary.php (псевдокод)
$eventId = $this->saveEvent($type, $userId, $entityType, $entityId, $payload);

$xp = XpLibrary::award($userId, $type, $entityId, $eventId);
if ($xp > 0) {
    // обновить users.xp, users.level, проверить разблокировку достижений
    LevelsLibrary::push($userId);
    AchievementsLibrary::check($userId);
}
```

`XpLibrary::award()` возвращает 0 если начисление заблокировано лимитом или правилом.

---

## Технические задачи

### БД
- Поля `users.experience` и `users.level` уже существуют — миграция не нужна
- [ ] Опционально: создать таблицу `xp_transactions` для аудита

### Backend
- [ ] `XpLibrary` — класс с методами `award()`, `shouldAward()`, `recalculate()`
- [ ] Таблица XP-ставок и лимитов в конфиге (не хардкод в коде)
- [ ] Таблица порогов уровней в конфиге
- [ ] Интеграция `XpLibrary::award()` в `ActivityLibrary`
- [ ] `php spark xp:recalculate [--user-id=X]`
- [ ] `php spark xp:recalculate-levels`
- [ ] Убрать старую логику из `LevelsLibrary` (если она дублирует)

### Frontend
- [ ] Убедиться, что `users.xp` и `users.level` возвращаются в API ответах где нужно
- [ ] Показывать +XP анимацию при начислении (опционально, после основной реализации)
