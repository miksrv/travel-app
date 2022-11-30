import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {RootState} from "./store";

export interface IRestResponse {
    status: boolean
    payload?: any
    errorText?: string
}

export interface IRestPoi extends IRestResponse {
    payload: any
}

export interface IRestPoiItem {
    id: string
    latitude: number
    longitude: number
    name: string
}

export interface ICurrentLocation {
    lat: number
    lon: number
}

export interface IMapBoundaries {
    north: number,
    south: number,
    east: number,
    west: number,
}

// Define a service using a base URL and expected endpoints
export const poiApi = createApi({
    reducerPath: 'poiApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_API_HOST || 'http://travelapp.miksoft.pro/',
        prepareHeaders: (headers, { getState }) => {
            // By default, if we have a token in the store, let's use that for authenticated requests
            //const token = (getState() as RootState).auth.token
            // if (token) {
            //     headers.set('AuthToken', token)
            // }
            return headers
        }
    }),
    endpoints: (builder) => ({
        postCurrentLocation: builder.mutation<IRestPoiItem[], ICurrentLocation>({
            query: (data) => ({
                url: 'location/discover',
                method: 'POST',
                body: data
            }),
        }),

        postMapBoundaries: builder.mutation<IRestPoiItem[], IMapBoundaries>({
            query: (data) => ({
                url: 'location/poi',
                method: 'POST',
                body: data
            }),
        }),
    }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { usePostCurrentLocationMutation, usePostMapBoundariesMutation } = poiApi
