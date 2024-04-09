'use client'

import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { ApiTypes } from '@/api/types'

import { convertDMS } from '@/functions/coordinates'

import styles from './styles.module.sass'

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
