import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { IMG_HOST } from '@/api/api'
import { ApiTypes, Poi } from '@/api/types'

import styles from './styles.module.sass'

interface MarkerPhotoClusterProps {
    marker: Poi.Photo
    onClick?: (coords: ApiTypes.LatLonCoordinate) => void
}

const MarkerPhotoCluster: React.FC<MarkerPhotoClusterProps> = ({
    marker,
    onClick
}) => {
    const clusterMarkerIcon = new Leaflet.DivIcon({
        className: styles.clusterPhoto,
        html:
            '<img src="' +
            IMG_HOST +
            marker.preview +
            '" alt="" /><div class="map-placemark-cluster-count">' +
            marker.count +
            '</div></div>'
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

export default MarkerPhotoCluster
