import { User } from './user'

import { DateTime } from '@/api/types'

export type Rating = {
    value: number
    session?: string
    created?: DateTime
    author?: User
}
