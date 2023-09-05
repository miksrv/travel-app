import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

type Maybe<T> = T | void

const encodeQueryData = (data: any): string => {
    const ret = []
    for (let d in data) {
        if (d && data[d]) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
        }
    }

    return ret.length ? '?' + ret.join('&') : ''
}

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
        introduce: builder.mutation<any, Maybe<any>>({
            invalidatesTags: ['Places'],
            query: (params) => `introduce${encodeQueryData(params)}`
        }),

        placesGetItem: builder.query<any, string>({
            providesTags: ['Places'],
            query: (item) => `places/${item}`
        }),
        placesGetList: builder.query<any, void>({
            providesTags: ['Places'],
            query: () => 'places?sort=distance&order=ASC'
        }),

        poiGetItem: builder.mutation<any, string>({
            query: (item) => `poi/${item}`
        }),
        poiGetList: builder.mutation<any, Maybe<any>>({
            query: (params) => `poi${encodeQueryData(params)}`
        })
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath]
        }
    },
    reducerPath: 'api',
    tagTypes: ['Places']
})

// Export hooks for usage in functional components
export const {
    useIntroduceMutation,

    usePlacesGetItemQuery,
    usePlacesGetListQuery,

    usePoiGetItemMutation,
    usePoiGetListMutation,

    util: { getRunningQueriesThunk }
} = api

// export endpoints for use in SSR
// export const {} = api.endpoints
