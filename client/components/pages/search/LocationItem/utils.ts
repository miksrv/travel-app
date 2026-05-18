import { ApiModel } from '@/api'

interface LocationParts {
    primary: string
    secondary: string
}

export const buildLocationParts = (location: ApiModel.GeoSearchLocation): LocationParts => {
    const parts: string[] = []

    if (location.street) {
        parts.push(location.street)
    }
    if (location.locality) {
        parts.push(location.locality)
    }
    if (location.district) {
        parts.push(location.district)
    }
    if (location.region) {
        parts.push(location.region)
    }
    if (location.country) {
        parts.push(location.country)
    }

    const [primary, ...rest] = parts

    return {
        primary: primary ?? '',
        secondary: rest.join(', ')
    }
}
