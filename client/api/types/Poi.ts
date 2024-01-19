import { ApiTypes } from '@/api/types'
import { Categories } from '@/api/types/Place'
import { User } from '@/api/types/User'

export type Place = {
    id?: string
    category: Categories
    lat: number
    lng: number
}

export type Photo = {
    placeId: string
    lat: number
    lng: number
    filename: string
    extension: string
    author?: User
    created?: ApiTypes.DateTimeType
}
