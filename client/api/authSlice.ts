import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { deleteCookie, setCookie } from 'cookies-next'

import { ApiTypes } from '@/api/types'
import { User } from '@/api/types/User'

import * as LocalStorage from '@/functions/localstorage'
import { LOCAL_STORAGE } from '@/functions/constants'

type AuthStateProps = {
    isAuth?: boolean
    token?: string
    session?: string
    user?: User
}

export const getStorageToken = (): string =>
    typeof window !== 'undefined'
        ? LocalStorage.getItem(LOCAL_STORAGE.AUTH_TOKEN as any)
        : ''

export const getStorageSession = (): string | undefined =>
    typeof window !== 'undefined'
        ? LocalStorage.getItem(LOCAL_STORAGE.AUTH_SESSION as any)
        : ''

const authSlice = createSlice({
    initialState: {
        session: getStorageSession(),
        token: getStorageToken()
    } as AuthStateProps,
    name: 'auth',
    reducers: {
        login: (
            state,
            { payload }: PayloadAction<ApiTypes.ResponseAuthLogin | undefined>
        ) => {
            state.token = payload?.token || ''
            state.session = payload?.session || ''
            state.user = payload?.user || undefined
            state.isAuth = payload?.auth || false

            if (payload?.auth && !!payload?.token) {
                setCookie(LOCAL_STORAGE.AUTH_TOKEN, true)

                LocalStorage.setItem(
                    LOCAL_STORAGE.AUTH_TOKEN as any,
                    payload.token
                )
            } else {
                deleteCookie(LOCAL_STORAGE.AUTH_TOKEN)
                LocalStorage.removeItem(LOCAL_STORAGE.AUTH_TOKEN as any)
            }
        },
        logout: (state) => {
            state.token = undefined
            state.user = undefined
            state.isAuth = false

            deleteCookie(LOCAL_STORAGE.AUTH_TOKEN)
            LocalStorage.removeItem(LOCAL_STORAGE.AUTH_TOKEN as any)
        },
        saveSession: (state, { payload }: PayloadAction<string>) => {
            state.session = payload
        }
    }
})

export const { login, logout, saveSession } = authSlice.actions

export default authSlice.reducer
