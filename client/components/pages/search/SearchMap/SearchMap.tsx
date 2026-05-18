import React, { useMemo } from 'react'

import dynamic from 'next/dynamic'

import { ApiModel, ApiType } from '@/api'

import { computeMapView } from './utils'

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })

export interface SearchMapProps {
    places?: ApiModel.Place[]
    locations?: ApiModel.GeoSearchLocation[]
    coordinates?: ApiType.Search.Response['coordinates']
}

export const SearchMap: React.FC<SearchMapProps> = ({ places, locations, coordinates }) => {
    const placeMarks = useMemo<ApiModel.PlaceMark[]>(
        () =>
            places
                ?.filter((p): p is ApiModel.Place & { lat: number; lon: number } => p.lat != null && p.lon != null)
                .map((p) => ({
                    id: p.id,
                    category: p.category?.name as ApiModel.Categories,
                    lat: p.lat,
                    lon: p.lon
                })) ?? [],
        [places]
    )

    const { center, zoom } = useMemo(() => {
        const points = [
            ...(places
                ?.filter((p): p is ApiModel.Place & { lat: number; lon: number } => p.lat != null && p.lon != null)
                .map((p) => ({ lat: p.lat, lon: p.lon })) ?? []),
            ...(locations?.filter((l) => l.lat != null && l.lon != null).map((l) => ({ lat: l.lat!, lon: l.lon! })) ??
                []),
            ...(coordinates ? [{ lat: coordinates.lat, lon: coordinates.lon }] : [])
        ]

        return computeMapView(points)
    }, [places, locations, coordinates])

    return (
        <InteractiveMap
            center={center}
            zoom={zoom}
            minZoom={2}
            places={placeMarks}
            scrollWheelZoom={true}
            controlsSize={'small'}
        />
    )
}
