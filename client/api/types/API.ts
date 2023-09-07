import { Place } from '@/api/types/Place'

export type Order = 'ASC' | 'DESC'

export type SortFields =
    | 'views'
    | 'rating'
    | 'title'
    | 'category'
    | 'subcategory'
    | 'distance'
    | 'created_at'
    | 'updated_at'

export interface ResponsePlacesGetList {
    items?: Place[]
    count?: number
}

export interface RequestPlacesGetList {
    sort?: SortFields
    order?: Order
    search?: string
    country?: number
    region?: number
    district?: number
    city?: number
    limit?: number
    offset?: number
    category?: string
    subcategory?: string
}
