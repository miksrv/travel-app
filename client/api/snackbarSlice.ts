import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import uniqueId from 'lodash-es/uniqueId'

import { store } from '@/api/store'

type Notification = {
    id: string
    title?: string
    content?: string
    icon?: string
    type?: 'success' | 'info' | 'warning' | 'error' | 'message'
    createdAt: number
}

type SnackbarStateProps = {
    notifications: Notification[]
}

const initialState: SnackbarStateProps = {
    notifications: []
}

export const addNotification = createAsyncThunk(
    'snackbar/addNotification',
    async (notification: Omit<Notification, 'id' | 'createdAt'>) => ({
        ...notification,
        createdAt: Date.now(),
        id: uniqueId()
    })
)

const snackbarSlice = createSlice({
    extraReducers: (builder) => {
        builder.addCase(addNotification.fulfilled, (state, action) => {
            state.notifications.push(action.payload)
        })
    },
    initialState,
    name: 'snackbar',
    reducers: {
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
