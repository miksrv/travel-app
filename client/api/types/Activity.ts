import { ApiTypes } from '@/api/types'

import { Photo } from './Photo'
import { Place } from './Place'
import { Rating } from './Rating'
import { User } from './User'

export const ActivityTypes = {
    Edit: 'edit',
    Photo: 'photo',
    Place: 'place',
    Rating: 'rating'
} as const
export type ActivityEnum = (typeof ActivityTypes)[keyof typeof ActivityTypes]

export type Item = {
    type: ActivityEnum
    place?: Place
    photos?: Photo[]
    rating?: Rating
    author?: User
    created?: ApiTypes.DateTimeType
}
