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

export type ApiNotification = {
    id: string
    type?: Types
    read?: boolean
    meta?: LevelData & ExperienceData
    value?: string
    activity?: ActivityType
}
