import { ApiTypes } from '@/api/types'

export type PlacesFilterType = {
    country?: number
    region?: number
    district?: number
    locality?: number
    category?: string
    page?: number
    tag?: string
    lat?: number
    lon?: number
    order?: ApiTypes.SortOrdersType
    sort?: ApiTypes.SortFieldsType
}
