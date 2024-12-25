import { ApiModel } from '@/api'

export type ItemResponse = ApiModel.User

export interface ListRequest {
    limit?: number
    offset?: number
}

export interface ListResponse {
    items?: ApiModel.User[]
    count?: number
}

export interface CropAvatarRequest {
    x: number
    y: number
    width: number
    height: number
    filename: string
}

export interface CropAvatarResponse {
    filepath: string
}

export interface PatchRequest extends Pick<ApiModel.User, 'settings' | 'website'> {
    id?: string
    name?: string
    oldPassword?: string
    newPassword?: string
}

export interface UploadAvatarResponse {
    filename: string
    filepath: string
    width: number
    height: number
}
