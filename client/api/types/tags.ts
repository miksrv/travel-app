import { ApiModel } from '@/api'

export interface ListResponse {
    items?: ApiModel.Tag[]
}

export interface SearchResponse {
    items?: string[]
}
