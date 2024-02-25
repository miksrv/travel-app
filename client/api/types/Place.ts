import { ApiTypes } from '@/api/types'

import { User } from './User'

export type Place = {
    id: string
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    lat: number
    lon: number
    rating: number
    views: number
    photos: number
    title: string
    content: string
    difference?: number
    distance?: number
    author?: User
    category?: Category
    address?: Location
    tags?: Tag[]
    cover?: {
        full: string
        preview: string
    }
}

export enum Categories {
    animals = 'animals',
    bridge = 'bridge',
    radiation = 'radiation',
    death = 'death',
    military = 'military',
    transport = 'transport',
    abandoned = 'abandoned',
    mine = 'mine',
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
    locality?: LocationObject
}

export type GeoSearchLocation = {
    lat?: number
    lon?: number
    country?: string
    region?: string
    district?: string
    locality?: string
    street?: string
}

export type LocationObject = {
    id: number
    title: string
}

export type Tag = {
    id: string
    title: string
}
