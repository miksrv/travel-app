import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import uniqueId from 'lodash-es/uniqueId'

import { RootState } from '@/api/store'
import { Notification } from '@/api/types/Notification'

type SnackbarStateProps = {
    list: Notification[]
    deleted: string[]
    counter: number
}

export const addNotification = createAsyncThunk(
    'snackbar/addNotification',
    async (notification: Notification, { dispatch, getState }) => {
        if (
            (getState() as RootState).notification.deleted.includes(
                notification.id
            )
        ) {
            notificationSlice.actions.deleteNotification(notification.id)

            return
        }

        const newNotification: Notification = {
            ...notification,
            id: notification.id || uniqueId()
        }

        dispatch(notificationSlice.actions.hideNotification(newNotification.id))

        if (notification.id) {
            dispatch(
                notificationSlice.actions.deleteNotification(newNotification.id)
            )
        }

        dispatch(notificationSlice.actions.addNotification(newNotification))

        setTimeout(() => {
            dispatch(deleteNotification(newNotification.id))
        }, 5000)

        return newNotification
    }
)

const notificationSlice = createSlice({
    initialState: {
        counter: 0,
        deleted: [],
        list: []
    } as SnackbarStateProps,
    name: 'snackbar',
    reducers: {
        addNotification: (state, { payload }: PayloadAction<Notification>) => {
            state.list.push(payload)
        },
        deleteAllNotifications: (state) => {
            state.list = []
        },
        deleteNotification: (state, { payload }: PayloadAction<string>) => {
            state.deleted = [...state.deleted, payload]
            state.list = state.list.filter(
                (notification) => notification.id !== payload
            )
        },
        hideNotification: (state, { payload }: PayloadAction<string>) => {
            state.deleted = [...state.deleted, payload]
        },
        setUnreadCounter: (state, { payload }: PayloadAction<number>) => {
            state.counter = payload
        }
    }
})

export const { deleteAllNotifications, deleteNotification, setUnreadCounter } =
    notificationSlice.actions

export default notificationSlice.reducer
