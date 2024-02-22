import { ApiTypes } from '@/api/types'
import { Categories } from '@/api/types/Place'
import { Place as PlaceType } from '@/api/types/Place'
import { User } from '@/api/types/User'

export type Place = Pick<PlaceType, 'id' | 'lat' | 'lon'> & {
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
