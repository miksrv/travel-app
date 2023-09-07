import { Place } from '@/api/types/Place'

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

export interface ResponsePlacesGetList {
    items?: Place[]
    count?: number
}

export interface RequestPlacesGetList {
    sort?: SortFields
    order?: SortOrder
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
