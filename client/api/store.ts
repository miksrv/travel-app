import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { createWrapper, HYDRATE } from 'next-redux-wrapper'
import { AnyAction, combineReducers, configureStore } from '@reduxjs/toolkit'

import applicationSlice from '@/api/applicationSlice'
import authSlice from '@/api/authSlice'
import notificationSlice from '@/api/notificationSlice'

import { API } from './api'
import { APIPastvu } from './apiPastvu'

// 1. Combine all reducers
const combinedReducer = combineReducers({
    application: applicationSlice,
    auth: authSlice,
    notification: notificationSlice,
    [API.reducerPath]: API.reducer,
    [APIPastvu.reducerPath]: APIPastvu.reducer
})

// 2. Process HYDRATE separately
type RootReducerState = ReturnType<typeof combinedReducer>

const rootReducer: (state: RootReducerState | undefined, action: AnyAction) => RootReducerState = (state, action) => {
    if (action.type === HYDRATE) {
        return {
            ...state, // old client state

            // application can be hydrated
            application:
                action.payload.application ??
                state?.application ??
                combinedReducer(undefined, { type: '' }).application,

            // notification can be hydrated
            notification:
                action.payload.notification ??
                state?.notification ??
                combinedReducer(undefined, { type: '' }).notification,

            // DO NOT touch auth if there is nothing in payload
            auth:
                action.payload.auth?.token || action.payload.auth?.isAuth
                    ? action.payload.auth
                    : (state?.auth ?? combinedReducer(undefined, { type: '' }).auth),

            [API.reducerPath]: {
                ...state?.[API.reducerPath],
                ...action.payload[API.reducerPath]
            },
            [APIPastvu.reducerPath]: {
                ...state?.[APIPastvu.reducerPath],
                ...action.payload[APIPastvu.reducerPath]
            }
        }
    }

    return combinedReducer(state, action)
}

// 3. Configure the store
export const makeStore = () =>
    configureStore({
        reducer: rootReducer,
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(API.middleware, APIPastvu.middleware)
    })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const wrapper = createWrapper<AppStore>(makeStore, { debug: false })
