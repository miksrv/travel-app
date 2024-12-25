import { User } from './user'

import { DateTime } from '@/api/types'

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
