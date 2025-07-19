import { DateTime } from '@/api/types'

import { User } from './user'

export type RatingHistory = {
    value: number
    created?: DateTime
    author?: User
}
