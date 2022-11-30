import { configureStore } from '@reduxjs/toolkit'
import {poiApi} from "./poiApi";
import {userApi} from "./userApi";

export const store = configureStore({
    reducer: {
        [poiApi.reducerPath]: poiApi.reducer,
        [userApi.reducerPath]: userApi.reducer
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(poiApi.middleware).concat(userApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
