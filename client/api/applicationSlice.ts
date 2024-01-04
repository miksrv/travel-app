import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type ApplicationStateProps = {
    showOverlay?: boolean
}

const applicationSlice = createSlice({
    initialState: {
        showOverlay: false
    } as ApplicationStateProps,
    name: 'auth',
    reducers: {
        toggleOverlay: (state, { payload }: PayloadAction<boolean>) => {
            state.showOverlay = payload
        }
    }
})

export const { toggleOverlay } = applicationSlice.actions

export default applicationSlice.reducer
