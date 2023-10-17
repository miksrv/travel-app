import Leaflet, { LatLngExpression } from 'leaflet'
import React from 'react'
import { Circle, Marker } from 'react-leaflet'

import userAvatar from '@/public/images/no-avatar.jpeg'

import styles from './styles.module.sass'

type MarkerUser = {
    latLng: LatLngExpression
}

const MarkerUser: React.FC<MarkerUser> = ({ latLng }) => {
    const userMarkerIcon = new Leaflet.Icon({
        className: styles.markerUser,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        iconUrl: userAvatar.src
    })

    return (
        <>
            {/*<Circle*/}
            {/*    center={latLng}*/}
            {/*    opacity={0.5} //Stroke opacity*/}
            {/*    color={'#227c23'} // Stroke color*/}
            {/*    weight={1} // Stroke width in pixels*/}
            {/*    stroke={true} // Whether to draw stroke along the path*/}
            {/*    fillColor={'#227c23'}*/}
            {/*    radius={500}*/}
            {/*/>*/}
            {/*<Marker*/}
            {/*    position={latLng}*/}
            {/*    icon={userMarkerIcon}*/}
            {/*/>*/}
        </>
    )
}

export default MarkerUser
