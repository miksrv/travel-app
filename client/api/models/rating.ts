import { DateTime } from '@/api/types'

import { User } from './user'

export type Rating = {
    value: number
    session?: string
    created?: DateTime
    author?: User
}
