import { ApiTypes } from '@/api/types'

import { User } from './User'

export type Photo = {
    id: string
    full: string
    preview: string
    width: number
    height: number
    title?: string
    author?: User
    created?: ApiTypes.DateTimeType
    filesize?: number
    placeId?: string
}
