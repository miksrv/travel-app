import { User } from './user'

import { DateTime } from '@/api/types'

export type RatingHistory = {
    value: number
    created?: DateTime
    author?: User
}
