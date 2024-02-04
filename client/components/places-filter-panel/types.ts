import { ApiTypes } from '@/api/types'

export type PlacesFilterType = {
    country?: number
    region?: number
    district?: number
    locality?: number
    category?: string
    order?: ApiTypes.SortOrder
    page?: number
    sort?: ApiTypes.SortFields
}
