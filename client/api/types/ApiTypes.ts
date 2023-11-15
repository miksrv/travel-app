import { AddressObject, Category, Place } from '@/api/types/Place'

import { Item } from './Activity'
import { Photo } from './Photo'
import { Photo as poiPhoto, Place as poiPlace } from './Poi'
import { Rating } from './Rating'
import { User } from './User'

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

export interface RequestAuthLogin {
    email?: string
    password?: string
}

export interface ResponseAuthLogin {
    token?: string
    auth?: boolean
    user?: User
}

/* Controller: Places */
export interface ResponsePlacesGetItem extends Place {}

export interface RequestPlacesGetList {
    sort?: SortFields
    order?: SortOrder
    bookmarkUser?: string
    author?: string
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

export interface ResponsePlacesGetList {
    items?: Place[]
    count?: number
}

/* Controller: Photos */
export interface ResponsePhotosGetList {
    items?: Photo[]
    count?: number
}

export interface RequestPhotosGetList {
    limit?: number
    offset?: number
    author?: string
    place?: string
}

export interface RequestPhotoPostUpload {
    formData?: FormData
    place?: string
}

/* Controller: Address */
export interface ResponseAddressGetSearch {
    countries?: AddressObject[]
    regions?: AddressObject[]
    districts?: AddressObject[]
    cities?: AddressObject[]
}

/* Controller: Place */
export interface ResponseCategoriesGetList extends Place {
    items?: Category[]
}

/* Controller: Rating */
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

/* Controller: Bookmarks */
export interface RequestBookmarkSet {
    place: string
}
export interface RequestBookmarkGetCheck {
    place: string
}

export interface ResponseBookmarkGetCheck {
    result: boolean
}

/* Controller: Visited */
export interface RequestVisitedSet {
    place: string
}

export interface ResponseVisitedUsersList {
    items: User[]
}

/* Controller: Activity */
export interface ResponseActivityGetList {
    items: Item[]
}

export interface RequestActivityGetList {
    date?: string
    author?: string
    place?: string
    limit?: number
    offset?: number
}

/* Controller: POI */
export interface RequestPoiList {
    bounds?: string
}

export interface ResponsePoiPlacesList {
    items: poiPlace[]
}

export interface ResponsePoiPhotosList {
    items: poiPhoto[]
}

/* Controller: User */
export interface ResponseUsersGetList {
    items?: User[]
    count?: number
}

export interface RequestUsersGetList {
    limit?: number
    offset?: number
}

export interface ResponseUsersGetItem extends User {}
