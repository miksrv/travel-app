import { ApiTypes } from '@/api/types'
import { LocaleType } from '@/api/types/ApiTypes'

export type User = {
    id: string
    name: string
    avatar?: string
    reputation?: number
    website?: string
    locale?: LocaleType
    level?: LevelData
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    activity?: ApiTypes.DateTimeType
    authType?: ApiTypes.AuthServiceType
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
