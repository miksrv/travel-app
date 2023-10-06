import { ApiTypes } from '@/api/types'

import { User } from './User'

export type Rating = {
    value: number
    session?: string
    created?: ApiTypes.DateTimeType
    author?: User
}
