import { AddressObject, Category, Place } from '@/api/types/Place'

import { Activity } from './Activity'
import { Rating } from './Rating'

export type DateTimeType = {
    date: string
    timezone_type: number
    timezone: string
}

export type PlaceLocationType = {
    title: string
    value: number
    type: LocationType
}

export const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC'
} as const
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]

export const SortFields = {
    Category: 'category',
    Created: 'created_at',
    Distance: 'distance',
    Rating: 'rating',
    Subcategory: 'subcategory',
    Title: 'title',
    Updated: 'updated_at',
    Views: 'views'
} as const
export type SortFields = (typeof SortFields)[keyof typeof SortFields]

export const LocationType = {
    City: 'city',
    Country: 'country',
    District: 'district',
    Region: 'region'
} as const
export type LocationType = (typeof LocationType)[keyof typeof LocationType]

export interface ResponsePlacesGetList {
    items?: Place[]
    count?: number
}

export interface ResponsePlacesGetItem extends Place {}

export interface RequestPlacesGetList {
    sort?: SortFields
    order?: SortOrder
    latitude?: number
    longitude?: number
    search?: string
    country?: number
    region?: number
    district?: number
    city?: number
    limit?: number
    offset?: number
    category?: string
    subcategory?: string
    excludePlaces?: string[]
}

export interface ResponseAddressGetSearch {
    countries?: AddressObject[]
    regions?: AddressObject[]
    districts?: AddressObject[]
    cities?: AddressObject[]
}

export interface ResponseCategoriesGetList extends Place {
    items?: Category[]
}

export interface ResponseRatingGetList {
    items?: Rating[]
    count?: number
    canVote?: boolean
}

export interface RequestRatingSet {
    place: string
    score: number
}

export interface ResponseRatingSet {
    rating: number
}

export interface ResponseActivityGetItem {
    items: Activity[]
}