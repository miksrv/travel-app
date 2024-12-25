import { ApiModel } from '@/api'

export interface Response {
    items?: ApiModel.Category[]
}

export interface Request {
    places?: boolean
}
