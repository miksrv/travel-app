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
}

export type LevelData = {
    name?: string
    text?: string
    level?: number
    experience?: number
    nextLevel?: number
}
