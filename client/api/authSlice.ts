import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { ApiTypes } from '@/api/types'
import { User } from '@/api/types/User'

export const ACCESS_TOKEN_KEY = 'authToken'

type AuthStateProps = {
    isAuth?: boolean
    error?: any
    token?: string
    user?: User
}

export const getStorageToken = (): string | undefined =>
    typeof window !== 'undefined' && localStorage.getItem(ACCESS_TOKEN_KEY)
        ? localStorage.getItem(ACCESS_TOKEN_KEY) ?? ''
        : ''

const authSlice = createSlice({
    initialState: {
        token: getStorageToken()
    } as AuthStateProps,
    name: 'auth',
    reducers: {
        login: (
            state,
            { payload }: PayloadAction<ApiTypes.ResponseAuthLogin | undefined>
        ) => {
            state.token = payload?.token || ''
            state.user = payload?.user || undefined
            state.isAuth = payload?.auth || false

            if (payload?.auth && !!payload?.token) {
                localStorage.setItem(ACCESS_TOKEN_KEY, payload?.token || '')
            } else {
                localStorage.setItem(ACCESS_TOKEN_KEY, '')
            }
        },
        logout: (state) => {
            state.token = undefined
            state.user = undefined
            state.isAuth = false

            localStorage.setItem(ACCESS_TOKEN_KEY, '')
        }
    }
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
