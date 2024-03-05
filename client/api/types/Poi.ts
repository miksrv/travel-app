import { Photo as PhotoType } from '@/api/types/Photo'
import { Categories, Place as PlaceType } from '@/api/types/Place'

export type Place = Pick<PlaceType, 'lat' | 'lon'> & {
    id?: string
    category: Categories
}

export type Photo = Pick<
    PhotoType,
    'title' | 'preview' | 'full' | 'placeId'
> & {
    lat: number
    lon: number
}
