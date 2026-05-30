import { ApiModel } from '@/api'

export interface Response {
    items?: ApiModel.Category[]
    count?: number
    bookmarksCount?: number
}

export interface Request {
    places?: boolean
    counts?: boolean
}

export interface TopRequest {
    limit?: number
}

export interface TopResponse {
    items?: ApiModel.TopCategory[]
}
