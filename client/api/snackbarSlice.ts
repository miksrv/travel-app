import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import uniqueId from 'lodash-es/uniqueId'

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
    async (
        notification: Omit<Notification, 'id' | 'createdAt'>,
        { dispatch }
    ) => {
        const newNotification: Notification = {
            ...notification,
            createdAt: Date.now(),
            id: uniqueId()
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
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            )
        }
    }
})

export const { deleteAllNotifications, deleteNotification } =
    snackbarSlice.actions

export default snackbarSlice.reducer
