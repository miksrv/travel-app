import { ApiTypes } from '@/api/types'

import { Author } from './Author'
import { Photo } from './Photo'
import { Place } from './Place'
import { Rating } from './Rating'

export const ActivityTypes = {
    Photo: 'photo',
    Place: 'place',
    Rating: 'rating'
} as const
export type ActivityTypes = (typeof ActivityTypes)[keyof typeof ActivityTypes]

export type Activity = {
    type: ActivityTypes
    photo?: Photo
    place?: Place
    rating?: Rating
    author?: Author
    created?: ApiTypes.DateTimeType
}
