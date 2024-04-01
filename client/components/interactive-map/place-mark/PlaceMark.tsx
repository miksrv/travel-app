import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { ApiTypes } from '@/api/types'

import { convertDMS } from '@/functions/helpers'

interface PlaceMarkProps extends ApiTypes.LatLonCoordinate {
    onClick?: () => void
}

// #TODO Move global styles for this component to styles.module.sass
const PlaceMark: React.FC<PlaceMarkProps> = ({ lat, lon, onClick }) => {
    const placeMarkerIcon = new Leaflet.DivIcon({
        className: 'map-placemark',
        html:
            '<div class="map-placemark-title">' +
            convertDMS(lat, lon) +
            '</div>'
    })

    return (
        <Marker
            position={[lat, lon]}
            icon={placeMarkerIcon}
            eventHandlers={{
                click: onClick
            }}
        />
    )
}

export default PlaceMark
