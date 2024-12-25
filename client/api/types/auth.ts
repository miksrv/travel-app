import { ApiModel, ApiType } from '@/api'

export interface LoginResponse {
    session?: string
    redirect?: string
    token?: string
    auth?: boolean
    user?: ApiModel.User
}

export interface PostLoginServiceRequest {
    service: ApiType.AuthService
    code?: string
    state?: string
    device_id?: string
}

export interface PostLoginNativeRequest {
    email?: string
    password?: string
}

export interface PostRegistrationRequest {
    name?: string
    email?: string
    password?: string
}
