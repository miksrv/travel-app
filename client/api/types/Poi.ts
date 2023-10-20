import { ApiTypes } from '@/api/types'
import { Categories } from '@/api/types/Place'
import { User } from '@/api/types/User'

export type Place = {
    id?: string
    category: Categories
    latitude: number
    longitude: number
}

export type Photo = {
    placeId: string
    latitude: number
    longitude: number
    filename: string
    extension: string
    title: string
    author?: User
    created?: ApiTypes.DateTimeType
}
