import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { setCookie } from 'cookies-next'

import { ApiTypes } from '@/api/types'

import * as LocalStorage from '@/functions/localstorage'
import { LOCAL_STORAGE } from '@/functions/constants'

import i18Config from '../next-i18next.config'

type ApplicationStateProps = {
    showOverlay?: boolean
    showAuthDialog?: boolean
    theme?: 'light' | 'dark'
    userLocation?: ApiTypes.LatLonCoordinate
    locale?: ApiTypes.LocaleType
}

export const getStorageLocale = (): string | undefined =>
    typeof window !== 'undefined'
        ? LocalStorage.getItem(LOCAL_STORAGE.LOCALE as any) ??
          i18Config.i18n.defaultLocale
        : i18Config.i18n.defaultLocale

export const getStorageTheme = (): string | undefined => {
    const theme =
        typeof window !== 'undefined'
            ? LocalStorage.getItem(LOCAL_STORAGE.THEME as any) ?? 'light'
            : 'light'

    return theme
}

const applicationSlice = createSlice({
    initialState: {
        locale: getStorageLocale(),
        showAuthDialog: false,
        showOverlay: false,
        theme: getStorageTheme()
    } as ApplicationStateProps,
    name: 'application',
    reducers: {
        closeAuthDialog: (state) => {
            state.showOverlay = false
            state.showAuthDialog = false
        },
        openAuthDialog: (state) => {
            state.showOverlay = true
            state.showAuthDialog = true
        },
        setLocale: (state, { payload }: PayloadAction<ApiTypes.LocaleType>) => {
            state.locale = payload
        },
        setUserLocation: (
            state,
            { payload }: PayloadAction<ApiTypes.LatLonCoordinate>
        ) => {
            setCookie(LOCAL_STORAGE.LOCATION, `${payload.lat};${payload.lon}`)

            state.userLocation = payload
        },
        toggleOverlay: (state, { payload }: PayloadAction<boolean>) => {
            state.showOverlay = payload
        },
        toggleTheme: (state, { payload }: PayloadAction<'light' | 'dark'>) => {
            if (payload === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }

            LocalStorage.setItem(LOCAL_STORAGE.THEME as any, payload)
            state.theme = payload
        }
    }
})

export const {
    toggleOverlay,
    toggleTheme,
    closeAuthDialog,
    openAuthDialog,
    setLocale,
    setUserLocation
} = applicationSlice.actions

export default applicationSlice.reducer
