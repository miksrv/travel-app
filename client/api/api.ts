import { encodeQueryData } from '@/functions/helpers'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

import { ApiTypes } from '@/api/types'
import { ResponseRatingSet } from '@/api/types/ApiTypes'

type Maybe<T> = T | void

export const imageHost =
    process.env.NEXT_PUBLIC_IMG_HOST || process.env.NEXT_PUBLIC_API_HOST

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8080/',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            // const token = (getState() as RootState).auth.userToken
            //
            // if (token) {
            //     headers.set('Authorization', token)
            // }

            return headers
        }
    }),
    endpoints: (builder) => ({
        addressGetSearch: builder.mutation<
            ApiTypes.ResponseAddressGetSearch,
            Maybe<string>
        >({
            query: (searchString) => `address?search=${searchString}`
        }),

        categoriesGetList: builder.query<
            ApiTypes.ResponseCategoriesGetList,
            void
        >({
            query: () => 'categories'
        }),

        introduce: builder.mutation<any, Maybe<any>>({
            // invalidatesTags: ['Places'],
            query: (params) => `introduce${encodeQueryData(params)}`
        }),

        placesGetItem: builder.query<ApiTypes.ResponsePlacesGetItem, string>({
            providesTags: ['Places'],
            query: (item) => `places/${item}`
        }),

        placesGetList: builder.query<
            ApiTypes.ResponsePlacesGetList,
            Maybe<ApiTypes.RequestPlacesGetList>
        >({
            providesTags: ['Places'],
            query: (params) => `places${encodeQueryData(params)}`
        }),
        poiGetItem: builder.mutation<any, string>({
            query: (item) => `poi/${item}`
        }),

        poiGetList: builder.mutation<any, Maybe<any>>({
            query: (params) => `poi${encodeQueryData(params)}`
        }),

        ratingGetList: builder.query<ApiTypes.ResponseRatingGetList, string>({
            providesTags: ['Rating'],
            query: (item) => `rating/${item}`
        }),
        ratingPutScore: builder.mutation<
            ApiTypes.ResponseRatingSet,
            ApiTypes.RequestRatingSet
        >({
            invalidatesTags: [{ type: 'Rating' }],
            query: (data) => ({
                body: data,
                method: 'PUT',
                url: 'rating'
            }),
            transformErrorResponse: (response) => response.data
        })
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath]
        }
    },
    reducerPath: 'api',
    tagTypes: ['Places', 'Rating']
})

// Export hooks for usage in functional components
export const {
    useAddressGetSearchMutation,

    useCategoriesGetListQuery,

    useIntroduceMutation,

    usePlacesGetItemQuery,
    usePlacesGetListQuery,

    usePoiGetItemMutation,
    usePoiGetListMutation,

    useRatingGetListQuery,
    useRatingPutScoreMutation,

    util: { getRunningQueriesThunk }
} = api

// export endpoints for use in SSR
// export const {} = api.endpoints
