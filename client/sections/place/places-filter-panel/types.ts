import { ApiType } from '@/api'

export type PlacesFilterType = {
    country?: number
    region?: number
    district?: number
    locality?: number
    /** Comma-joined category names (multi-select). */
    category?: string
    page?: number
    tag?: string
    lat?: number
    lon?: number
    order?: ApiType.SortOrdersType
    sort?: ApiType.SortFieldsType
    search?: string
    /** '1' when only the current user's bookmarks should be shown. */
    bookmarks?: '1'
}
