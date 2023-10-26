import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { User } from '@/api/types/User'

type TAuthType = {
    error: any
    userAuth: boolean
    userInfo?: User
    userToken?: string
}

const initialState: TAuthType = {
    error: null,
    userAuth: false,
    userToken: ''
}

const authSlice = createSlice({
    extraReducers: {},
    initialState,
    name: 'auth',
    reducers: {
        login: (state, { payload }: PayloadAction<any>) => {
            state.userToken = payload?.accessToken || undefined
            state.userInfo = payload?.user || undefined
            state.userAuth = true

            localStorage.setItem('userToken', payload?.accessToken || '')
        },
        logout: (state) => {
            state.userToken = ''
            state.userInfo = undefined
            state.userAuth = false

            localStorage.setItem('userToken', '')
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.userToken = action.payload
        },
        setUserAuth: (state, action: PayloadAction<boolean>) => {
            state.userAuth = action.payload
        },
        setUserInfo: (state, action: PayloadAction<User>) => {
            state.userInfo = action.payload
        }
    }
})

export const { login, logout, setToken, setUserInfo, setUserAuth } =
    authSlice.actions

export const getStorageToken = (): string =>
    typeof window !== 'undefined' && localStorage.getItem('userToken')
        ? localStorage.getItem('userToken') ?? ''
        : ''

export default authSlice.reducer
