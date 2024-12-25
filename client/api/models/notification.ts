import { Place } from './place'
import { UserLevel } from './userLevel'

import { ActivityType, DateTime } from '@/api/types'

export type Notification = {
    id: string
    title?: string
    message?: string
    read?: boolean
    type?: ActivityType
    meta?: UserLevel & { value?: number }
    activity?: ActivityType
    place?: Pick<Place, 'id' | 'title' | 'cover'>
    created?: DateTime
}
