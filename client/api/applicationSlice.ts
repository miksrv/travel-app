import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ApplicationStateProps = {
    showOverlay?: boolean
    showAuthDialog?: boolean
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
        toggleOverlay: (state, { payload }: PayloadAction<boolean>) => {
            state.showOverlay = payload
        }
    }
})

export const { toggleOverlay, closeAuthDialog, openAuthDialog } =
    applicationSlice.actions

export default applicationSlice.reducer
