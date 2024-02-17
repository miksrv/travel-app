import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { ApiTypes } from '@/api/types'
import { User } from '@/api/types/User'

import { LOCAL_STORGE } from '@/functions/constants'

type AuthStateProps = {
    isAuth?: boolean
    token?: string
    session?: string
    user?: User
}

export const getStorageToken = (): string | undefined =>
    typeof window !== 'undefined' &&
    localStorage.getItem(LOCAL_STORGE.AUTH_TOKEN)
        ? localStorage.getItem(LOCAL_STORGE.AUTH_TOKEN) ?? ''
        : ''

export const getStorageSession = (): string | undefined =>
    typeof window !== 'undefined' &&
    localStorage.getItem(LOCAL_STORGE.AUTH_SESSION)
        ? localStorage.getItem(LOCAL_STORGE.AUTH_SESSION) ?? ''
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
                localStorage.setItem(
                    LOCAL_STORGE.AUTH_TOKEN,
                    payload?.token || ''
                )
            } else {
                localStorage.removeItem(LOCAL_STORGE.AUTH_TOKEN)
            }
        },
        logout: (state) => {
            state.token = undefined
            state.user = undefined
            state.isAuth = false

            localStorage.removeItem(LOCAL_STORGE.AUTH_TOKEN)
        },
        saveSession: (state, { payload }: PayloadAction<string>) => {
            state.session = payload
        }
    }
})

export const { login, logout, saveSession } = authSlice.actions

export default authSlice.reducer
