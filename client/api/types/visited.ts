import { ApiModel } from '@/api'

export interface ListResponse {
    items: ApiModel.User[]
}

// TODO: Change place to placeId
export interface PutRequest {
    place: string
}
