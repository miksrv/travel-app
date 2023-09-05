import { Author } from './Author'
import { Photo } from './Photo'

export type Place = {
    id: number
    latitude: number
    longitude: number
    rating: number
    views: number
    title: string
    content: string
    author?: Author
    category?: Category
    subcategory?: Category
    address?: Address
    tags?: Tag[]
    photosCount?: number
    photos?: Photo[]
}

export type Category = {
    name: string
    title: string
}

export type Address = {
    street?: string
    country?: AddressObject
    region?: AddressObject
    district?: AddressObject
    city?: AddressObject
}

export type AddressObject = {
    id: number
    name: string
}

export type Tag = {
    id: string
    title: string
    counter: number
}
