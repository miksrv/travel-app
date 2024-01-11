import { ApiTypes } from '@/api/types'

export type PlacesFilterType = {
    category?: string
    order?: ApiTypes.SortOrder
    page?: number
    sort?: ApiTypes.SortFields
}
