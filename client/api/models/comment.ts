import { DateTime } from '@/api/types'

import { User } from './user'

export type Comment = {
    id: string
    content: string
    author: User
    answerId?: string
    created?: DateTime
}
