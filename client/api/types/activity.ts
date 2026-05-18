import { ApiModel } from '@/api'

export interface GetListResponse {
    items: ApiModel.Activity[]
    has_more?: boolean
}

export interface GetListRequest {
    date?: string
    author?: string
    place?: string
    limit?: number
    offset?: number
}
