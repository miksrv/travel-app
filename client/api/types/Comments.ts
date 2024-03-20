import { ApiTypes } from '@/api/types'

import { User } from './User'

export type Comments = {
    id: string
    content: string
    author: User
    answerId?: string
    created?: ApiTypes.DateTimeType
}
