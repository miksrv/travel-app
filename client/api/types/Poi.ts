import { Categories } from '@/api/types/Place'

export type Place = {
    id?: string
    category: Categories
    latitude: number
    longitude: number
}

export type Photo = {
    place: string
    latitude: number
    longitude: number
    filename: string
    extension: string
    title: string
}
