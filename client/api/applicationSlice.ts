import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { ApiTypes } from '@/api/types'

type ApplicationStateProps = {
    showOverlay?: boolean
    showAuthDialog?: boolean
    userLocation?: ApiTypes.LatLonCoordinate
}

const applicationSlice = createSlice({
    initialState: {
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
        setUserLocation: (
            state,
            { payload }: PayloadAction<ApiTypes.LatLonCoordinate>
        ) => {
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
    setUserLocation
} = applicationSlice.actions

export default applicationSlice.reducer
