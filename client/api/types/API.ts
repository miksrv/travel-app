import { Place } from '@/api/types/Place'

export type SortFields =
    | 'views'
    | 'rating'
    | 'created'
    | 'updated'
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
    order?: 'ASC' | 'DESC'
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
