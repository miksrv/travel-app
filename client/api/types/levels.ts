import { ApiModel } from '@/api'

export interface Response {
    awards?: {
        place?: number
        photo?: number
        rating?: number
        cover?: number
        edit?: number
        comment?: number
    }
    items?: Array<
        ApiModel.UserLevel & {
            count?: number
            users?: Array<Pick<ApiModel.User, 'id' | 'avatar' | 'name'>>
        }
    >
}
