import { Place } from '@/api/types/Place'
import { LevelData } from '@/api/types/User'

export type ActivityType = 'photo' | 'place' | 'rating' | 'edit' | 'cover'

export type Types =
    | 'photo'
    | 'place'
    | 'rating'
    | 'edit'
    | 'cover'
    | 'experience'
    | 'level'
    | 'achievements'

export type ExperienceData = {
    value?: number
}

export type Notification = {
    id: string
    type?: Types
    meta?: LevelData & ExperienceData
    activity?: ActivityType
    place?: Pick<Place, 'id' | 'title' | 'cover'>
}
