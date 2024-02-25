import type { Action, PayloadAction } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

import { RootState } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { encodeQueryData } from '@/functions/helpers'

type Maybe<T> = T | void

export const IMG_HOST =
    process.env.NEXT_PUBLIC_IMG_HOST || process.env.NEXT_PUBLIC_API_HOST

export const SITE_LINK = process.env.NEXT_PUBLIC_SITE_LINK

const isHydrateAction = (action: Action): action is PayloadAction<RootState> =>
    action.type === HYDRATE

export const isApiValidationErrors = <T>(
    response: unknown
): response is ApiTypes.ApiResponseError<T> =>
    typeof response === 'object' &&
    response != null &&
    'messages' in response &&
    typeof (response as any).messages === 'object'

export const API = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8080/',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            const token = (getState() as RootState).auth.token
            const session = (getState() as RootState).auth.session
            const locale = (getState() as RootState).application.locale

            if (token) {
                headers.set('Authorization', token)
            }

            if (session) {
                headers.set('Session', session)
            }

            if (locale) {
                headers.set('Locale', locale)
            }

            return headers
        }
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

        /* Controller: Auth */
        authGetMe: builder.query<ApiTypes.ResponseAuthLogin, void>({
            providesTags: ['Profile'],
            query: () => 'auth/me'
        }),
        authLoginService: builder.mutation<
            ApiTypes.ResponseAuthLogin,
            ApiTypes.RequestAuthService
        >({
            query: ({ service, code }) =>
                `auth/${service}${code ? `?code=${code}` : ''}`,
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
        authPostRegistration: builder.mutation<
            ApiTypes.ResponseAuthLogin,
            ApiTypes.RequestAuthRegistration
        >({
            query: (credentials) => ({
                body: credentials,
                method: 'POST',
                url: 'auth/registration'
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
                { id: arg.place, type: 'Bookmarks' },
                { type: 'Notifications' }
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

        /* Controller: Location */
        locationGetByType: builder.query<
            ApiTypes.ResponseLocationGetByType,
            ApiTypes.RequestLocationGetByType
        >({
            query: (params) => `location/${params.id}?type=${params.type}`
        }),
        locationGetGeosearch: builder.mutation<
            ApiTypes.ResponseLocationGetGeoSearch,
            Maybe<string>
        >({
            query: (searchString) => `location/geosearch?text=${searchString}`
        }),
        locationGetSearch: builder.mutation<
            ApiTypes.ResponseLocationGetSearch,
            Maybe<string>
        >({
            query: (searchString) => `location/search?text=${searchString}`
        }),
        locationPutCoordinates: builder.mutation<
            void,
            Maybe<ApiTypes.LatLonCoordinate>
        >({
            query: (params) => ({
                body: params,
                method: 'PUT',
                url: 'location'
            })
        }),

        /* Controller: Notifications */
        notificationsDelete: builder.mutation<void, void>({
            invalidatesTags: [{ type: 'Notifications' }],
            query: () => ({
                method: 'DELETE',
                url: 'notifications'
            })
        }),
        notificationsGetList: builder.query<
            ApiTypes.ResponseNotificationsGet,
            Maybe<ApiTypes.RequestNotificationsGetList>
        >({
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg !== previousArg,
            merge: (currentCache, newItems, { arg }) => {
                if (
                    (arg?.offset as number) === 0 &&
                    newItems?.count === 0 &&
                    currentCache.items
                ) {
                    currentCache.items.length = 0
                } else {
                    currentCache.items?.push(...(newItems?.items || []))
                }
            },
            providesTags: ['Notifications'],
            query: (params) => `notifications/list${encodeQueryData(params)}`,
            serializeQueryArgs: ({ endpointName }) => endpointName
        }),
        notificationsGetUpdates: builder.query<
            ApiTypes.ResponseNotificationsGet,
            void
        >({
            providesTags: ['Notifications'],
            query: () => 'notifications/updates'
        }),

        /* Controller: Photos */
        photoDeleteItem: builder.mutation<
            ApiTypes.ResponsePhotoDeleteItem,
            string
        >({
            query: (photoId) => ({
                method: 'DELETE',
                url: `photos/${photoId}`
            })
        }),
        photoPostUpload: builder.mutation<
            ApiTypes.ResponsePhotoPostUpload,
            ApiTypes.RequestPhotoPostUpload
        >({
            invalidatesTags: (res, err, arg) => [
                { id: arg.place, type: 'Photos' },
                { id: arg.place, type: 'Activity' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data.formData,
                method: 'POST',
                url: `photos/upload/${data.place}`
            }),
            transformErrorResponse: (response) => response.data
        }),
        photoRotateItem: builder.mutation<
            ApiTypes.ResponsePhotoRotateItem,
            string
        >({
            query: (photoId) => ({
                method: 'PATCH',
                url: `photos/rotate/${photoId}`
            })
        }),
        photosGetActions: builder.query<
            ApiTypes.ResponsePhotosGetActions,
            Maybe<ApiTypes.RequestPhotosGetActions>
        >({
            query: (params) => `photos/actions${encodeQueryData(params)}`
        }),
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
        placesPatchCover: builder.mutation<
            void,
            ApiTypes.RequestPlacesPatchCover
        >({
            invalidatesTags: (res, err, arg) => [
                { id: arg.placeId, type: 'Places' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data,
                method: 'PATCH',
                url: `places/cover/${data.placeId}`
            }),
            transformErrorResponse: (response) => response.data
        }),
        placesPatchItem: builder.mutation<
            ApiTypes.ResponsePlacesPatchItem,
            ApiTypes.RequestPlacesPostItem
        >({
            invalidatesTags: (res, err, arg) => [
                { id: arg.id, type: 'Places' },
                { type: 'Activity' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data,
                method: 'PATCH',
                url: `places/${data.id}`
            }),
            transformErrorResponse: (response) => response.data
        }),
        placesPostItem: builder.mutation<
            ApiTypes.ResponsePlacesPostItem,
            Omit<ApiTypes.RequestPlacesPostItem, 'id'>
        >({
            invalidatesTags: [
                { type: 'Places' },
                { type: 'Activity' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data,
                method: 'POST',
                url: 'places'
            }),
            transformErrorResponse: (response) => response.data
        }),

        /* Controller: POI */
        poiGetItem: builder.mutation<ApiTypes.ResponsePoiItem, string>({
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
            invalidatesTags: [
                { type: 'Rating' },
                { type: 'Activity' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data,
                method: 'PUT',
                url: 'rating'
            }),
            transformErrorResponse: (response) => response.data
        }),

        /* Controller: Sitemap */
        sitemapGetList: builder.query<ApiTypes.ResponseSitemapGet, void>({
            query: () => 'sitemap'
        }),

        /* Controller: Tags */
        tagsGetItem: builder.query<ApiTypes.ResponseTagsGetItem, Maybe<string>>(
            {
                query: (item) => `tags/${item}`
            }
        ),
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
        usersPatchCropAvatar: builder.mutation<
            ApiTypes.ResponseUsersCropAvatar,
            ApiTypes.RequestUsersCropAvatar
        >({
            invalidatesTags: () => ['Users', 'Profile'],
            query: (data) => ({
                body: data,
                method: 'PATCH',
                url: 'users/crop'
            }),
            transformErrorResponse: (response) => response.data
        }),
        usersPatchProfile: builder.mutation<void, ApiTypes.RequestUsersPatch>({
            invalidatesTags: (res, err, arg) => [
                { id: arg.id, type: 'Users' },
                { type: 'Users' }
            ],
            query: (data) => ({
                body: data,
                method: 'PATCH',
                url: `users/${data.id}`
            }),
            transformErrorResponse: (response) => response.data
        }),
        usersPostUploadAvatar: builder.mutation<
            ApiTypes.ResponseUserUploadAvatar,
            any
        >({
            query: (data) => ({
                body: data.formData,
                method: 'POST',
                url: 'users/avatar'
            }),
            transformErrorResponse: (response) => response.data
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
                { id: arg.place, type: 'Visited' },
                { type: 'Notifications' }
            ],
            query: (data) => ({
                body: data,
                method: 'PUT',
                url: 'visited'
            }),
            transformErrorResponse: (response) => response.data
        })
    }),
    extractRehydrationInfo(action, { reducerPath }): any {
        if (isHydrateAction(action)) {
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
        'Users',
        'Profile',
        'Notifications'
    ]
})

// Export hooks for usage in functional components
export const {
    util: { getRunningQueriesThunk }
} = API
