import { ApiTypes } from '@/api/types'

import { Photo } from './Photo'
import { User } from './User'

export type Place = {
    id: string
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    lat: number
    lon: number
    rating: number
    views: number
    title: string
    content: string
    difference?: number
    distance?: number
    author?: User
    category?: Category
    address?: Location
    photo?: Photo
    tags?: Tag[]
    photoCount?: number
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

export type Location = {
    street?: string
    country?: LocationObject
    region?: LocationObject
    district?: LocationObject
    city?: LocationObject
}

export type LocationObject = {
    id: number
    title: string
}

export type Tag = {
    id: string
    title: string
}
