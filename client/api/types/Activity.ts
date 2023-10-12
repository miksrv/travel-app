import { ApiTypes } from '@/api/types'

import { Photo } from './Photo'
import { Place } from './Place'
import { Rating } from './Rating'
import { User } from './User'

export const ActivityTypes = {
    Photo: 'photo',
    Place: 'place',
    Rating: 'rating'
} as const
export type ActivityTypes = (typeof ActivityTypes)[keyof typeof ActivityTypes]

export type Item = {
    type: ActivityTypes
    photo?: Photo
    photos?: Photo[]
    place?: Place
    rating?: Rating
    author?: User
    created?: ApiTypes.DateTimeType
}
