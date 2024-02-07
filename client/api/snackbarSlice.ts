import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import uniqueId from 'lodash-es/uniqueId'

import { RootState } from '@/api/store'
import { Notification } from '@/api/types/Notification'

type SnackbarStateProps = {
    notifications: Notification[]
    deleted: string[]
}

const initialState: SnackbarStateProps = {
    deleted: [],
    notifications: []
}

export const addNotification = createAsyncThunk(
    'snackbar/addNotification',
    async (notification: Notification, { dispatch, getState }) => {
        if (
            (getState() as RootState).snackbar.deleted.includes(notification.id)
        ) {
            snackbarSlice.actions.deleteNotification(notification.id)

            return
        }

        const newNotification: Notification = {
            ...notification,
            id: notification.id || uniqueId()
        }

        dispatch(snackbarSlice.actions.hideNotification(newNotification.id))

        if (notification.id) {
            dispatch(
                snackbarSlice.actions.deleteNotification(newNotification.id)
            )
        }

        dispatch(snackbarSlice.actions.addNotification(newNotification))

        setTimeout(() => {
            dispatch(deleteNotification(newNotification.id))
        }, 5000)

        return newNotification
    }
)

const snackbarSlice = createSlice({
    initialState,
    name: 'snackbar',
    reducers: {
        addNotification(state, action: PayloadAction<Notification>) {
            state.notifications.push(action.payload)
        },
        deleteAllNotifications(state) {
            state.notifications = []
        },
        deleteNotification(state, action: PayloadAction<string>) {
            state.deleted = [...state.deleted, action.payload]
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            )
        },
        hideNotification(state, action: PayloadAction<string>) {
            state.deleted = [...state.deleted, action.payload]
        }
    }
})

export const { deleteAllNotifications, deleteNotification } =
    snackbarSlice.actions

export default snackbarSlice.reducer
