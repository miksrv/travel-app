import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

import { RootState } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { encodeQueryData } from '@/functions/helpers'

type Maybe<T> = T | void

export const IMG_HOST =
    process.env.NEXT_PUBLIC_IMG_HOST || process.env.NEXT_PUBLIC_API_HOST

export const SITE_LINK = process.env.NEXT_PUBLIC_SITE_LINK

export const API = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8080/',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const token = (getState() as RootState).auth.token

            if (token) {
                headers.set('Authorization', token)
            }

            return headers
        }
        // responseHandler: 'content-type'
    }),
    endpoints: (builder) => ({
        /* Controller: Activity */
        activityGetInfinityList: builder.query<
            ApiTypes.ResponseActivityGetList,
            Maybe<ApiTypes.RequestActivityGetList>
        >({
            // Refetch when the page arg changes
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg !== previousArg,
            // Always merge incoming data to the cache entry
            merge: (currentCache, newItems) => {
                currentCache.items.push(...newItems.items)
            },
            providesTags: (result, error, arg) => [
                { id: arg?.place || arg?.author, type: 'Activity' }
            ],
            query: (params) => `activity${encodeQueryData(params)}`,
            // Only have one cache entry because the arg always maps to one string
            serializeQueryArgs: ({ endpointName }) => endpointName
        }),
        activityGetList: builder.query<
            ApiTypes.ResponseActivityGetList,
            Maybe<ApiTypes.RequestActivityGetList>
        >({
            providesTags: (result, error, arg) => [
                { id: arg?.place || arg?.author, type: 'Activity' }
            ],
            query: (params) => `activity${encodeQueryData(params)}`
        }),

        /* Controller: Address */
        addressGetSearch: builder.mutation<
            ApiTypes.ResponseAddressGetSearch,
            Maybe<string>
        >({
            query: (searchString) => `address?search=${searchString}`
        }),

        /* Controller: Auth */
        authGetMe: builder.mutation<ApiTypes.ResponseAuthLogin, void>({
            query: () => 'auth/me'
        }),
        authGoogleLogin: builder.mutation<
            ApiTypes.ResponseAuthLogin,
            ApiTypes.RequestAuthGoogle
        >({
            query: (params) => `auth/google${encodeQueryData(params)}`,
            transformErrorResponse: (response) => response.data
        }),
        authPostLogin: builder.mutation<
            ApiTypes.ResponseAuthLogin,
            ApiTypes.RequestAuthLogin
        >({
            query: (credentials) => ({
                body: credentials,
                method: 'POST',
                url: 'auth/login'
            }),
            transformErrorResponse: (response) => response.data
        }),

        /* Controller: Bookmarks */
        bookmarksGetCheckPlace: builder.query<
            ApiTypes.ResponseBookmarkGetCheck,
            ApiTypes.RequestBookmarkGetCheck
        >({
            providesTags: (result, error, arg) => [
                { id: arg.place, type: 'Bookmarks' }
            ],
            query: (params) => `bookmarks${encodeQueryData(params)}`
        }),
        bookmarksPutPlace: builder.mutation<void, ApiTypes.RequestBookmarkSet>({
            invalidatesTags: (res, err, arg) => [
                { id: arg.place, type: 'Bookmarks' }
            ],
            query: (data) => ({
                body: data,
                method: 'PUT',
                url: 'bookmarks'
            }),
            transformErrorResponse: (response) => response.data
        }),

        /* Controller: Categories */
        categoriesGetList: builder.query<
            ApiTypes.ResponseCategoriesGetList,
            void
        >({
            query: () => 'categories'
        }),

        /* Controller: Introduce */
        introduce: builder.mutation<any, Maybe<any>>({
            // invalidatesTags: ['Places'],
            query: (params) => `introduce${encodeQueryData(params)}`
        }),

        /* Controller: Location */
        locationGetByType: builder.query<
            ApiTypes.ResponseLocationGetByType,
            ApiTypes.RequestLocationGetByType
        >({
            query: (params) => `location/${params.id}?type=${params.type}`
        }),
        locationGetGeocoder: builder.query<
            any,
            Maybe<ApiTypes.RequestLocationGetGeocoder>
        >({
            query: (params) => `location/geocoder${encodeQueryData(params)}`
        }),

        /* Controller: Photos */
        photoPostUpload: builder.mutation<any, ApiTypes.RequestPhotoPostUpload>(
            {
                invalidatesTags: (res, err, arg) => [
                    { id: arg.place, type: 'Photos' },
                    { id: arg.place, type: 'Activity' }
                ],
                query: (data) => ({
                    body: data.formData,
                    method: 'POST',
                    url: `photos/upload/${data.place}`
                }),
                transformErrorResponse: (response) => response.data
            }
        ),
        photosGetList: builder.query<
            ApiTypes.ResponsePhotosGetList,
            Maybe<ApiTypes.RequestPhotosGetList>
        >({
            providesTags: (result, error, arg) => [
                { id: arg?.place, type: 'Photos' }
            ],
            query: (params) => `photos${encodeQueryData(params)}`
        }),

        /* Controller: Places */
        placesGetItem: builder.query<ApiTypes.ResponsePlacesGetItem, string>({
            providesTags: (result, error, arg) => [{ id: arg, type: 'Places' }],
            query: (item) => `places/${item}`
        }),
        placesGetList: builder.query<
            ApiTypes.ResponsePlacesGetList,
            Maybe<ApiTypes.RequestPlacesGetList>
        >({
            providesTags: ['Places'],
            query: (params) => `places${encodeQueryData(params)}`
        }),
        placesGetRandom: builder.query<ApiTypes.ResponsePlacesGetRandom, void>({
            query: () => 'places/random'
        }),
        placesPatchItem: builder.mutation<
            ApiTypes.ResponsePlacesPatchItem,
            ApiTypes.RequestPlacesPatchItem
        >({
            invalidatesTags: (res, err, arg) => [
                { id: arg.id, type: 'Places' },
                { type: 'Activity' }
            ],
            query: (data) => ({
                body: data,
                method: 'PATCH',
                url: `places/${data.id}`
            })
        }),

        /* Controller: POI */
        poiGetItem: builder.mutation<any, string>({
            query: (item) => `poi/${item}`
        }),
        poiGetList: builder.query<
            ApiTypes.ResponsePoiPlacesList,
            Maybe<ApiTypes.RequestPoiList>
        >({
            query: (params) => `poi${encodeQueryData(params)}`
        }),
        poiGetPhotoList: builder.query<
            ApiTypes.ResponsePoiPhotosList,
            Maybe<ApiTypes.RequestPoiList>
        >({
            query: (params) => `poi/photos${encodeQueryData(params)}`
        }),

        /* Controller: Rating */
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
        }),

        /* Controller: Tags */
        tagsGetSearch: builder.mutation<
            ApiTypes.ResponseTagsGetSearch,
            Maybe<string>
        >({
            query: (searchString) => `tags?search=${searchString}`
        }),

        /* Controller: User */
        usersGetItem: builder.query<ApiTypes.ResponseUsersGetItem, string>({
            providesTags: ['Users'],
            query: (item) => `users/${item}`
        }),
        usersGetList: builder.query<
            ApiTypes.ResponseUsersGetList,
            Maybe<ApiTypes.RequestUsersGetList>
        >({
            providesTags: ['Users'],
            query: (params) => `users${encodeQueryData(params)}`
        }),

        /* Controller: Visited */
        visitedGetUsersList: builder.query<
            ApiTypes.ResponseVisitedUsersList,
            string
        >({
            providesTags: (result, error, arg) => [
                { id: arg, type: 'Visited' }
            ],
            query: (item) => `visited/${item}`
        }),
        visitedPutPlace: builder.mutation<void, ApiTypes.RequestVisitedSet>({
            invalidatesTags: (res, err, arg) => [
                { id: arg.place, type: 'Visited' }
            ],
            query: (data) => ({
                body: data,
                method: 'PUT',
                url: 'visited'
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
    tagTypes: [
        'Activity',
        'Bookmarks',
        'Places',
        'Photos',
        'Rating',
        'Visited',
        'Users'
    ]
})

// Export hooks for usage in functional components
export const {
    util: { getRunningQueriesThunk }
} = API
