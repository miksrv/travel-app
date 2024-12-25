import { setCookie } from 'cookies-next'

import i18Config from '../next-i18next.config'

import { ApiType } from '@/api'
import { LOCAL_STORAGE } from '@/functions/constants'
import * as LocalStorage from '@/functions/localstorage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ApplicationStateProps = {
    showOverlay?: boolean
    showAuthDialog?: boolean
    userLocation?: ApiType.Coordinates
    locale?: ApiType.Locale
}

export const getStorageLocale = (): string | undefined =>
    typeof window !== 'undefined'
        ? (LocalStorage.getItem(LOCAL_STORAGE.LOCALE as any) ?? i18Config.i18n.defaultLocale)
        : i18Config.i18n.defaultLocale

const applicationSlice = createSlice({
    initialState: {
        locale: getStorageLocale(),
        showAuthDialog: false,
        showOverlay: false
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
        setLocale: (state, { payload }: PayloadAction<ApiType.Locale>) => {
            state.locale = payload
        },
        setUserLocation: (state, { payload }: PayloadAction<ApiType.Coordinates>) => {
            setCookie(LOCAL_STORAGE.LOCATION, `${payload.lat};${payload.lon}`)

            state.userLocation = payload
        },
        toggleOverlay: (state, { payload }: PayloadAction<boolean>) => {
            state.showOverlay = payload
        }
    }
})

export const { toggleOverlay, closeAuthDialog, openAuthDialog, setLocale, setUserLocation } = applicationSlice.actions

export default applicationSlice.reducer
