import { ApiTypes } from '@/api/types'

export type User = {
    id: string
    name: string
    avatar?: string

    /* Optional parameters */
    reputation?: number
    level?: number
    created?: ApiTypes.DateTimeType
    updated?: ApiTypes.DateTimeType
}
