import { ApiTypes } from '@/api/types'

import { Author } from './Author'

export type Photo = {
    filename: string
    extension: string
    width: number
    height: number
    title?: string
    author?: Author
    created?: ApiTypes.DateTimeType
    filesize?: number
    order?: number
}
