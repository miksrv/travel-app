'use client'

import React from 'react'
import { Marker } from 'react-leaflet'
import Leaflet from 'leaflet'

import styles from './styles.module.sass'

import { ApiTypes, Placemark } from '@/api/types'

interface MarkerPointClusterProps {
    marker: Placemark.Place | Placemark.Photo
    onClick?: (coords: ApiTypes.LatLonCoordinate) => void
}

const MarkerPointCluster: React.FC<MarkerPointClusterProps> = ({ marker, onClick }) => {
    const clusterMarkerIcon = new Leaflet.DivIcon({
        className: styles.mapPointCluster,
        html: '<div>' + marker.count + '</div>'
    })

    return (
        <Marker
            position={[marker.lat, marker.lon]}
            icon={clusterMarkerIcon}
            eventHandlers={{
                click: () => onClick?.({ lat: marker.lat, lon: marker.lon })
            }}
        />
    )
}

export default MarkerPointCluster
