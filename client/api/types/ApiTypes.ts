import { AddressObject, Category, Place } from '@/api/types/Place'

import { Item } from './Activity'
import { Photo } from './Photo'
import { Photo as poiPhoto, Place as poiPlace } from './Poi'
import { User } from './User'

/** General Types **/
export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

export type DateTimeType = {
    date: string
    timezone_type: number
    timezone: string
}

export type PlaceLocationType = {
    value: string
    key: number
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

export type LocationTypes = 'country' | 'region' | 'district' | 'city'

export interface RequestAuthLogin {
    email?: string
    password?: string
}
export interface RequestAuthGoogle {
    code?: string
}

export interface ResponseAuthLogin {
    redirect?: string
    token?: string
    auth?: boolean
    user?: User
}

/* Controller: Places */
export interface ResponsePlacesGetItem extends Place {
    randomId?: string
}

export interface ResponsePlacesGetList {
    items?: Place[]
    count?: number
}

export interface ResponsePlacesGetRandom {
    id?: string
}

export interface RequestPlacesGetList {
    sort?: SortFields
    order?: SortOrder
    bookmarkUser?: string
    author?: string
    latitude?: number
    longitude?: number
    search?: string
    country?: number | null
    region?: number | null
    district?: number | null
    city?: number | null
    limit?: number
    offset?: number
    category?: string | null
    excludePlaces?: string[]
}

export interface RequestPlacesPatchItem {
    id: string
    content?: string
    title?: string
    tags?: string[]
}

export interface ResponsePlacesPatchItem {
    status: boolean
}

export interface RequestPlacesPostItem {
    title?: string
    content?: string
    category?: string
    tags?: string[]
    coordinates?: LatLngCoordinate
}

export interface ResponsePlacesPostItem {
    id: string
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

/* Controller: Location */
export interface ResponseLocationGetByType extends AddressObject {}

export interface RequestLocationGetByType {
    id?: number | null
    type?: LocationTypes
}

export interface RequestLocationGetGeocoder {
    lat?: number
    lng?: number
}

/* Controller: Address */
export interface ResponseAddressGetSearch {
    countries?: AddressObject[]
    regions?: AddressObject[]
    districts?: AddressObject[]
    cities?: AddressObject[]
}

/* Controller: Tags */
export interface ResponseTagsGetSearch {
    items?: string[]
}

/* Controller: Place */
export interface ResponseCategoriesGetList extends Place {
    items?: Category[]
}

/* Controller: Rating */
export interface ResponseRatingGetList {
    rating?: number
    count?: number
    vote?: number | null
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
    category?: string
}

export interface ResponsePoiPlacesList {
    items: poiPlace[]
    count: number
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
