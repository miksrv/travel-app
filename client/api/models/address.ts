import { ApiType } from '@/api'

export type AddressItem = {
    id: number
    name: string
    type?: ApiType.LocationTypes
}

export type Address = {
    street?: string
    country?: AddressItem
    region?: AddressItem
    district?: AddressItem
    locality?: AddressItem
}
