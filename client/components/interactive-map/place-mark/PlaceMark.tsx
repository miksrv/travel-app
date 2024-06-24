'use client'

import React from 'react'
import { Marker } from 'react-leaflet'
import Leaflet from 'leaflet'

import styles from './styles.module.sass'

import { ApiTypes } from '@/api/types'
import { convertDMS } from '@/functions/coordinates'

interface PlaceMarkProps extends ApiTypes.LatLonCoordinate {
    onClick?: () => void
}

const PlaceMark: React.FC<PlaceMarkProps> = ({ lat, lon, onClick }) => {
    const placeMarkerIcon = new Leaflet.DivIcon({
        className: styles.placeMark,
        html: '<div>' + convertDMS(lat, lon) + '</div>'
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
