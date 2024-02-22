import { ApiTypes } from '@/api/types'

export type PlacesFilterType = {
    country?: number
    region?: number
    district?: number
    locality?: number
    category?: string
    page?: number
    tag?: string
    order?: ApiTypes.SortOrder
    sort?: ApiTypes.SortFields
}
