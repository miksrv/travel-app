import { ApiModel } from '@/api'

export interface ListResponse {
    items?: ApiModel.Comment[]
    count: number
}

// TODO change place to placeId
export interface ListRequest {
    place?: string
}

export interface PostRequest {
    placeId?: string
    answerId?: string
    comment?: string
}
