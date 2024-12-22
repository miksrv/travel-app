import { Photo } from './photo'
import { Place } from './place'
import { Rating } from './rating'
import { User } from './user'

import { DateTime } from '@/api/types'

export type Activity = {
    type: ActivityEnum
    views?: number
    place?: Place
    photos?: Photo[]
    rating?: Rating
    author?: User
    created?: DateTime
}

export const ActivityTypes = {
    // Comment: 'comment',
    // Cover: 'cover',
    Edit: 'edit',
    Photo: 'photo',
    Place: 'place',
    Rating: 'rating'
} as const

export type ActivityEnum = (typeof ActivityTypes)[keyof typeof ActivityTypes]
