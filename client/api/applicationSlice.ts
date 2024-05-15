import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { setCookie } from 'cookies-next'

import { ApiTypes } from '@/api/types'

import { LOCAL_STORAGE } from '@/functions/constants'

import i18Config from '../next-i18next.config'

type ApplicationStateProps = {
    showOverlay?: boolean
    showAuthDialog?: boolean
    userLocation?: ApiTypes.LatLonCoordinate
    locale?: ApiTypes.LocaleType
}

export const getStorageLocale = (): string | undefined =>
    typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE.LOCALE)
        ? localStorage.getItem(LOCAL_STORAGE.LOCALE) ??
          i18Config.i18n.defaultLocale
        : i18Config.i18n.defaultLocale

const applicationSlice = createSlice({
    initialState: {
        locale: getStorageLocale(),
        showAuthDialog: false,
        showOverlay: false
    } as ApplicationStateProps,
    name: 'auth',
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
        }
    }
})

export const {
    toggleOverlay,
    closeAuthDialog,
    openAuthDialog,
    setLocale,
    setUserLocation
} = applicationSlice.actions

export default applicationSlice.reducer
