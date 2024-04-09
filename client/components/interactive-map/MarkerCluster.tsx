import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { ApiTypes, Poi } from '@/api/types'

interface MarkerPointProps {
    marker: Poi.Place | Poi.Photo
    onClick?: (coords: ApiTypes.LatLonCoordinate) => void
}

const MarkerCluster: React.FC<MarkerPointProps> = ({ marker, onClick }) => {
    const clusterMarkerIcon = new Leaflet.DivIcon({
        className: 'map-cluster',
        html: '<div class="map-placemark-cluster">' + marker.count + '</div>'
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

export default MarkerCluster
