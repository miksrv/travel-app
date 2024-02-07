import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import uniqueId from 'lodash-es/uniqueId'
import React from 'react'

import { Notification } from '@/api/types/Notification'

// export type Notification = {
//     id: string
//     title?: string
//     content?: React.ReactNode
//     icon?: React.ReactNode
//     type?: 'success' | 'error'
// }

type SnackbarStateProps = {
    notifications: Notification[]
}

const initialState: SnackbarStateProps = {
    notifications: []
}

export const addNotification = createAsyncThunk(
    'snackbar/addNotification',
    async (notification: Notification, { dispatch }) => {
        const newNotification: Notification = {
            ...notification,
            id: notification.id || uniqueId()
        }

        if (notification.id) {
            dispatch(
                snackbarSlice.actions.deleteNotification(newNotification.id)
            )
        }

        dispatch(snackbarSlice.actions.addNotification(newNotification))

        // setTimeout(() => {
        //     dispatch(deleteNotification(newNotification.id))
        // }, 5000)

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
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            )
        }
    }
})

export const { deleteAllNotifications, deleteNotification } =
    snackbarSlice.actions

export default snackbarSlice.reducer
