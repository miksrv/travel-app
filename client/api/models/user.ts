import { UserLevel } from './userLevel'
import { UserSettings } from './userSettings'
import { UserStatistic } from './userStatistic'

import { AuthService, DateTime, Locale, UserRole } from '@/api/types'

export type User = {
    id: string
    name: string
    email?: string
    avatar?: string
    reputation?: number
    website?: string
    role?: UserRole
    locale?: Locale
    levelData?: UserLevel
    created?: DateTime
    updated?: DateTime
    activity?: DateTime
    authType?: AuthService
    statistic?: UserStatistic
    settings?: UserSettings
}
