import { API } from './api'
import * as ApiModel from './models'
import { useAppDispatch, useAppSelector } from './store'
import * as ApiType from './types'

interface ApiResponseError<T> {
    status: number
    error: number
    messages: Record<keyof T, any>
}

export const IMG_HOST = process.env.NEXT_PUBLIC_IMG_HOST || process.env.NEXT_PUBLIC_API_HOST
export const SITE_LINK = process.env.NEXT_PUBLIC_SITE_LINK

export const isApiValidationErrors = <T>(response: unknown): response is ApiResponseError<T> =>
    typeof response === 'object' &&
    response != null &&
    'messages' in response &&
    typeof (response as any).messages === 'object'

export { API, ApiModel, ApiType, useAppDispatch, useAppSelector }
