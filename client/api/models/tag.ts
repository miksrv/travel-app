import { DateTime } from '@/api/types'

export type Tag = {
    id?: string
    title: string
    updated?: DateTime
    count?: number
}
