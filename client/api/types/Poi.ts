import { ApiTypes } from '@/api/types'
import { Categories, Place as PlaceType } from '@/api/types/Place'
import { User } from '@/api/types/User'

export type Place = Pick<PlaceType, 'lat' | 'lon'> & {
    id?: string
    category: Categories
}

export type Photo = {
    placeId: string
    full: string
    preview: string
    lat: number
    lon: number
    filename: string
    extension: string
    title?: string
    author?: User
    created?: ApiTypes.DateTimeType
}
