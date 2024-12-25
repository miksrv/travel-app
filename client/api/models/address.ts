export type AddressItem = {
    id: number
    title: string
}

export type Address = {
    street?: string
    country?: AddressItem
    region?: AddressItem
    district?: AddressItem
    locality?: AddressItem
}
