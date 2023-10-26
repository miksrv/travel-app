import { configureStore } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'

import authSlice from '@/api/authSlice'

import { API } from './api'

export const store = () =>
    configureStore({
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (gDM) => gDM().concat(API.middleware),
        reducer: {
            auth: authSlice,
            [API.reducerPath]: API.reducer
        }
    })

export type AppStore = ReturnType<typeof store>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const wrapper = createWrapper<AppStore>(store, { debug: false })
