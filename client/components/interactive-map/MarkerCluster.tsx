import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { Poi } from '@/api/types'

interface MarkerPointProps {
    place: Poi.Place
}

const MarkerCluster: React.FC<MarkerPointProps> = ({ place }) => {
    const clusterMarkerIcon = new Leaflet.DivIcon({
        className: 'map-cluster',
        html: '<div class="map-placemark-cluster">' + place.count + '</div>'
    })

    return (
        <Marker
            position={[place.lat, place.lon]}
            icon={clusterMarkerIcon}
            // eventHandlers={{
            //     click: onClick
            // }}
        />
    )
}

export default MarkerCluster
