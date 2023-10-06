import { ApiTypes } from '@/api/types'

import { Photo } from './Photo'
import { User } from './User'

export type Place = {
    id: string
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    latitude: number
    longitude: number
    rating: number
    views: number
    title: string
    content: string
    distance?: number
    author?: User
    category?: Category
    subcategory?: Category
    address?: Address
    tags?: Tag[]
    photosCount?: number
    photos?: Photo[]
    actions?: {
        rating?: boolean
    }
}

export enum Categories {
    battlefield = 'battlefield',
    fort = 'fort',
    transport = 'transport',
    abandoned = 'abandoned',
    mine = 'mine',
    factory = 'factory',
    construction = 'construction',
    memorial = 'memorial',
    monument = 'monument',
    museum = 'museum',
    castle = 'castle',
    manor = 'manor',
    religious = 'religious',
    archeology = 'archeology',
    cave = 'cave',
    waterfall = 'waterfall',
    spring = 'spring',
    nature = 'nature',
    water = 'water',
    mountain = 'mountain',
    camping = 'camping'
}

export type Category = {
    name: Categories
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
