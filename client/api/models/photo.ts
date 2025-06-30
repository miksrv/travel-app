import { DateTime } from '@/api/types'

import { User } from './user'

export type Photo = {
    id: string
    full: string
    preview: string
    width: number
    height: number
    title?: string
    author?: User
    created?: DateTime
    filesize?: number
    placeId?: string
}
