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
    title?: string
    level?: number
    experience?: number
    nextLevel?: number
}

export type Statistic = {
    place: number
    photo: number
    rating: number
    edit: number
    cover: number
    comment: number
}
