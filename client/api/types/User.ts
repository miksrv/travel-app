import { ApiTypes } from '@/api/types'

export type User = {
    id: string
    name: string
    avatar?: string

    /* Optional parameters */
    reputation?: number
    website?: string
    level?: LevelData
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    activity?: ApiTypes.DateTimeType
    statistic?: Statistic
}

export type LevelData = {
    name?: string
    text?: string
    level?: number
    experience?: number
    nextLevel?: number
}

export type Statistic = {
    places: number
    photos: number
    rating: number
    edits: number
}
