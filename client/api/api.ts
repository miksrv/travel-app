import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

import { ApiTypes } from '@/api/types'

import { encodeQueryData } from '@/functions/helpers'

type Maybe<T> = T | void

export const ImageHost =
    process.env.NEXT_PUBLIC_IMG_HOST || process.env.NEXT_PUBLIC_API_HOST

export const API = createApi({
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
        },
        responseHandler: 'content-type'
    }),
    endpoints: (builder) => ({
        activityGetItem: builder.query<
            ApiTypes.ResponseActivityGetList,
            string
        >({
            providesTags: ['Activity'],
            query: (item) => `activity/${item}`
        }),
        activityGetList: builder.query<
            ApiTypes.ResponseActivityGetList,
            Maybe<ApiTypes.RequestActivityGetList>
        >({
            // Refetch when the page arg changes
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg
            },
            // Always merge incoming data to the cache entry
            merge: (currentCache, newItems) => {
                currentCache.items.push(...newItems.items)
            },
            providesTags: ['Activity'],
            query: (params) => `activity${encodeQueryData(params)}`,
            // Only have one cache entry because the arg always maps to one string
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName
            }
        }),

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

        photosGetList: builder.query<
            ApiTypes.ResponsePhotosGetList,
            Maybe<ApiTypes.RequestPlacesGetList>
        >({
            providesTags: ['Photos'],
            query: (params) => `photos${encodeQueryData(params)}`
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
            invalidatesTags: [{ type: 'Rating' }, { type: 'Activity' }],
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
    tagTypes: ['Activity', 'Places', 'Photos', 'Rating']
})

// Export hooks for usage in functional components
export const {
    useActivityGetItemQuery,

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
} = API

// export endpoints for use in SSR
export const { placesGetItem, activityGetItem } = API.endpoints
