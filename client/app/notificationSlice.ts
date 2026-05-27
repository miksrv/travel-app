import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ApiModel } from '@/api'

import type { RootState } from './store'

const AUTO_DISMISS_MS = 10_000

type NotificationState = {
    list: ApiModel.Notification[]
}

// Module-level — survives Redux HYDRATE resets that happen on every Next.js page navigation
const dismissTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export const NotifyReplace = createAsyncThunk(
    'snackbar/replaceNotification',
    async (notification: ApiModel.Notification, { dispatch, getState }) => {
        if (!notification.type && !notification.message) {
            return
        }

        dispatch(notificationSlice.actions.replaceNotification(notification))

        if (dismissTimers[notification.id]) {
            clearTimeout(dismissTimers[notification.id])
        }

        dismissTimers[notification.id] = setTimeout(() => {
            const state = getState() as RootState
            const exists = state.notification.list.some(({ id }) => id === notification.id)

            if (exists) {
                dispatch(deleteNotification(notification.id))
            }

            delete dismissTimers[notification.id]
        }, AUTO_DISMISS_MS)
    }
)

export const Notify = createAsyncThunk(
    'snackbar/addNotification',
    async (notification: ApiModel.Notification, { dispatch, getState }) => {
        if (!notification.type && !notification.message) {
            return
        }

        dispatch(notificationSlice.actions.addNotification(notification))

        setTimeout(() => {
            const state = getState() as RootState
            const exists = state.notification.list.some(({ id }) => id === notification.id)

            if (exists) {
                dispatch(deleteNotification(notification.id))
            }
        }, AUTO_DISMISS_MS)

        return notification
    }
)

const notificationSlice = createSlice({
    initialState: {
        list: []
    } as NotificationState,
    name: 'snackbar',
    reducers: {
        addNotification: (state, { payload }: PayloadAction<ApiModel.Notification>) => {
            if (!state.list.find(({ id }) => id === payload.id)) {
                state.list = [...state.list, payload]
            }
        },
        deleteAllNotifications: (state) => {
            state.list = []
        },
        deleteNotification: (state, { payload }: PayloadAction<string>) => {
            state.list = state.list.filter(({ id }) => id !== payload)
        },
        replaceNotification: (state, { payload }: PayloadAction<ApiModel.Notification>) => {
            state.list = [...state.list.filter(({ id }) => id !== payload.id), { ...payload, read: false }]
        },
        setReadNotification: (state, { payload }: PayloadAction<string>) => {
            const notification = state.list.find(({ id }) => id === payload)

            if (notification) {
                state.list = [
                    ...(state.list.filter(({ id }) => id !== payload) || []),
                    {
                        ...notification,
                        read: true
                    }
                ]
            }
        }
    }
})

export const { deleteAllNotifications, setReadNotification, deleteNotification, addNotification } =
    notificationSlice.actions

export { notificationSlice }

export default notificationSlice.reducer
