import { ApiModel, ApiType } from '@/api'

// TODO: Refactoring this type, duplicated in two files
type PlaceAddress = {
    id?: number
    name?: string
    type: ApiType.LocationTypes
}

export const addressToString = (location?: ApiModel.Address): PlaceAddress[] => {
    const address: PlaceAddress[] = []

    if (location?.country?.id) {
        address.push({
            id: location.country.id,
            name: location.country.title,
            type: 'country'
        })
    }

    if (location?.locality?.id) {
        address.push({
            id: location.locality.id,
            name: location.locality.title,
            type: 'locality'
        })
    } else if (location?.district?.id) {
        address.push({
            id: location.district.id,
            name: location.district.title,
            type: 'district'
        })
    } else if (location?.region?.id) {
        address.push({
            id: location.region.id,
            name: location.region.title,
            type: 'region'
        })
    }

    return address
}
