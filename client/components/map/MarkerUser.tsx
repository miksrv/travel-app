import Leaflet from 'leaflet'
import React from 'react'
import { Circle, Marker } from 'react-leaflet'

import userAvatar from '@/public/images/no-avatar.jpeg'

import styles from './styles.module.sass'

type MarkerUser = {
    lat: number
    lon: number
}

const MarkerUser: React.FC<MarkerUser> = ({ lat, lon }) => {
    const userMarkerIcon = new Leaflet.Icon({
        className: styles.markerUser,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        iconUrl: userAvatar.src
    })

    return (
        <>
            <Circle
                center={{
                    lat: lat,
                    lng: lon
                }}
                opacity={0.5} //Stroke opacity
                color={'#227c23'} // Stroke color
                weight={1} // Stroke width in pixels
                stroke={true} // Whether to draw stroke along the path
                fillColor={'#227c23'}
                radius={500}
            />
            <Marker
                position={[lat, lon]}
                icon={userMarkerIcon}
            />
        </>
    )
}

export default MarkerUser
