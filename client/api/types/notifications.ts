import { ApiModel } from '@/api'

export interface ListResponse {
    items?: ApiModel.Notification[]
    count?: number
}

export interface ListRequest {
    limit?: number
    offset?: number
}
