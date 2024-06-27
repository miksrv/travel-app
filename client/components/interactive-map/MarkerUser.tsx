import React from 'react'
import { Circle, Marker } from 'react-leaflet'
import Leaflet from 'leaflet'

import styles from './styles.module.sass'

import { ApiTypes } from '@/api/types'
import userAvatar from '@/public/images/no-avatar.png'

interface MarkerUserProps {
    coordinates: ApiTypes.LatLonCoordinate
}

const MarkerUser: React.FC<MarkerUserProps> = ({ coordinates }) => {
    const userMarkerIcon = new Leaflet.Icon({
        className: styles.markerUser,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        iconUrl: userAvatar.src
    })

    return (
        <>
            <Circle
                center={[coordinates.lat, coordinates.lon]}
                opacity={0.5} //Stroke opacity
                color={'#227c23'} // Stroke color
                weight={1} // Stroke width in pixels
                stroke={true} // Whether to draw stroke along the path
                fillColor={'#227c23'}
                radius={500}
            />
            <Marker
                position={[coordinates.lat, coordinates.lon]}
                icon={userMarkerIcon}
            />
        </>
    )
}

export default MarkerUser
