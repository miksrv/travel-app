import { ApiTypes } from '@/api/types'

import { Author } from './Author'

export type Rating = {
    value: number
    session?: string
    created?: ApiTypes.DateTimeType
    author?: Author
}
