import { ApiTypes } from '@/api/types'

import { User } from './User'

export type Photo = {
    filename: string
    extension: string
    width: number
    height: number
    title?: string
    author?: User
    created?: ApiTypes.DateTimeType
    filesize?: number
    order?: number
    placeId?: string
}
