# Feature 22 — XP Snackbar & Notification Groups

> **Status: 🔄 In Progress**

## Overview

Redesign the snackbar notification system to make XP-gaining actions emotionally engaging. Instead of dry toast messages, show an animated `LevelProgressAnimated` component when the user earns experience. Multiple rapid XP events (e.g. uploading 10 photos) are merged into a single updating snack rather than flooding the screen with individual toasts.

The architecture introduces a **Group Slots** concept alongside the existing per-item list, laying the groundwork for future grouped notification types (achievements, streaks, etc.).

---

## Problems with the Current System

| Problem | Detail |
|---------|--------|
| No grouping | 10 photo uploads = 10 identical snackbars |
| Dry XP messages | `+5 опыт` with no level context or animation |
| No merge | `Notify` thunk only appends, never updates existing items |
| Static progress | `LevelProgress` has no animation capability |
| Flat architecture | All notifications treated equally, no concept of groups |

---

## Architecture: Group Slots

### Core concept

The notification state is split into two lanes:

```
state.notification.list    — individual toasts (success / error / activity)
state.notification.groups  — named slots, updated in place with merge window
```

A **group slot** remains "open" for N seconds after the last event (merge window). Any new event for the same group updates the existing snack in place instead of creating a new one. The auto-dismiss timer resets on each merge.

### Notification groups

| Group ID | Merge | Trigger source | Visual component | Status |
|----------|-------|---------------|-----------------|--------|
| `xp` | Yes, 4 s | client (optimistic) + server | `GroupSnackItem` + `LevelProgressAnimated` | **This feature** |
| `achievement` | No (queued) | server | `AchievementSnackItem` | Future |
| system (no slot) | No | client | existing `Notification` | Unchanged |
| activity (no slot) | No | server | existing `Notification` | Unchanged |

---

## State Shape

```typescript
// notificationSlice.ts additions

type GroupSlot = {
    groupId: 'xp' | 'achievement'
    id: string
    actions: string[]       // ["Фото загружено", "Точка отредактирована"]
    xpTotal: number         // total XP accumulated in this merge window
    fromExperience: number  // animate FROM this value
    toExperience: number    // animate TO this value
    fromLevel: number
    toLevel: number
    toNextLevel: number
    mergeUntil: number      // timestamp: window closes after this
    read: boolean
}

// Extended state (backward-compatible)
type NotificationState = {
    list: ApiModel.Notification[]           // unchanged
    groups: Record<string, GroupSlot>       // new
}
```

---

## New Redux Actions & Thunks

```typescript
// New synchronous reducers
openGroupSlot(state, payload: GroupSlot)
mergeGroupSlot(state, payload: { groupId: string; action: string; xpGained: number; toExperience: number; toLevel: number; toNextLevel: number })
closeGroupSlot(state, payload: string)   // groupId

// New async thunk
NotifyXp({
    action: string       // human-readable label, e.g. "Фото загружено"
    xpGained: number     // points for this specific action (from MODIFIER_* constants)
    levelData: UserLevel // current user levelData from Redux auth state
})

// Internal logic of NotifyXp:
// 1. If groups['xp'] exists AND Date.now() < groups['xp'].mergeUntil
//    → dispatch(mergeGroupSlot(...))
//    → reset auto-dismiss timer
// 2. Else
//    → dispatch(openGroupSlot(...))
//    → setTimeout(10_000, () => dispatch(closeGroupSlot('xp')))
```

---

## New Components

### `LevelProgressAnimated`

Located: `components/shared/level-progress-animated/`

```
Props:
  fromExperience: number    ← XP before the action
  toExperience:   number    ← XP after the action
  fromLevel:      number
  toLevel:        number
  nextLevel:      number    ← XP threshold for next level
  badgeSize?:     number

Behaviour:
  1. Renders immediately with fromExperience → bar at initial position
  2. useEffect fires after 300 ms delay (snackbar slide-in completes)
     → setState({ displayExperience: toExperience })
  3. CSS transition: width 0.8s ease → bar crawls to new position

Level-up path (fromLevel !== toLevel):
  Phase 1 (0 ms)    → animate bar to 100%
  Phase 2 (900 ms)  → swap LevelBadge to new level number + color, reset bar to 0%
  Phase 3 (1050 ms) → animate bar to toExperience / toNextLevel progress
```

### `GroupSnackItem`

Located: `components/layout/snackbar/`

```
Visual layout:
┌─────────────────────────────────────────┐
│ [LevelBadge]  Фото загружено  +5 XP     │
│               (и ещё 2 действия)         │
│               ████████░░  1 250 / 2 000  │  ← LevelProgressAnimated
└─────────────────────────────────────────┘

Props: GroupSlot + onClose
```

### `Snackbar.tsx` updates

- Render `Object.values(state.notification.groups)` above `state.notification.list`
- When backend polling delivers `type: 'experience'` → call `NotifyXp` instead of `Notify`
- When backend delivers `type: 'level'` → treat as XP event (merge into `xp` group)

---

## Client Call Sites (NotifyXp dispatch)

Add `dispatch(NotifyXp({ action, xpGained, levelData }))` on successful mutation in:

| File | Action label | XP value constant |
|------|-------------|-------------------|
| `PhotoUploader.tsx` | "Фото загружено" | `MODIFIER_PHOTO` |
| `PlaceDescription.tsx` | "Точка отредактирована" | `MODIFIER_EDIT` |
| `PlaceCoverEditor.tsx` | "Обложка обновлена" | `MODIFIER_COVER` |
| `PlaceForm.tsx` (new place) | "Новая точка добавлена" | `MODIFIER_PLACE` |
| `WasHereButton.tsx` | "Отметка о посещении" | `MODIFIER_RATING` |
| `PlaceActionBar.tsx` (rating) | "Оценка поставлена" | `MODIFIER_RATING` |

> XP modifier constants (`MODIFIER_PHOTO`, etc.) are defined server-side in `app/Config/` and returned by `GET /auth/me` in the `awards` field. The client should read them from the auth response rather than hardcoding, or expose them via a dedicated `/modifiers` endpoint.

---

## Server polling deduplication

When the 15-second poll delivers an `experience` notification that was already shown optimistically:

- If `groups['xp']` is still open: compare `toExperience` vs server value — if they match, skip; if they differ (race condition), do a quiet merge with corrected values
- If `groups['xp']` is closed (already dismissed): ignore the server notification silently (mark as read without showing)

This keeps the optimistic UX snappy while the server remains the source of truth.

---

## Implementation Steps

- [ ] **Step 1** — Extend `notificationSlice.ts`: add `groups` to state, add `openGroupSlot` / `mergeGroupSlot` / `closeGroupSlot` reducers, add `NotifyXp` async thunk
- [ ] **Step 2** — Create `LevelProgressAnimated` component with `useEffect`-triggered CSS transition and level-up two-phase animation
- [ ] **Step 3** — Create `GroupSnackItem` component (layout + wires up `LevelProgressAnimated`)
- [ ] **Step 4** — Update `Snackbar.tsx`: render groups lane, route `experience`/`level` backend events through `NotifyXp`
- [ ] **Step 5** — Update client call sites: add `NotifyXp` dispatch on success in PhotoUploader, PlaceDescription, PlaceCoverEditor, PlaceForm, WasHereButton, PlaceActionBar
- [ ] **Step 6** — Expose XP modifier values on the client (read from `GET /auth/me` awards field or add to Redux auth state)

---

## What Is NOT Changed

- `Notify` thunk and its call sites — unchanged, still used for success/error/warning
- Header notification bell (`NotificationList`) — unchanged
- Backend notification delivery — unchanged
- `ApiModel.Notification` type — unchanged (GroupSlot is a separate frontend-only type)
