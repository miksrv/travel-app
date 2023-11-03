import { ApiTypes } from '@/api/types'

export type User = {
    id: string
    name: string
    avatar?: string

    /* Optional parameters */
    reputation?: number
    level?: number
    website?: string
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
    activity?: ApiTypes.DateTimeType
}
