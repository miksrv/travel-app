import { User } from './user'

import { DateTime } from '@/api/types'

export type Comment = {
    id: string
    content: string
    author: User
    answerId?: string
    created?: DateTime
}
