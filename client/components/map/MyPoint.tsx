import Leaflet from 'leaflet'
import React from 'react'
import { Circle, Marker } from 'react-leaflet'

import userAvatar from '@/public/images/no-avatar.jpeg'

import styles from './styles.module.sass'

type TMyPointProps = {
    lat: number
    lon: number
}

const MyPoint: React.FC<TMyPointProps> = ({ lat, lon }) => {
    const myIcon = new Leaflet.Icon({
        className: styles.userIcon,
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        iconUrl: userAvatar.src
        // popupAnchor: [-3, -76],
        // shadowAnchor: [22, 94],
        // shadowSize: [68, 95],
        // shadowUrl: 'my-icon-shadow.png'
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
                icon={myIcon}
            />
        </>
    )
}

export default MyPoint
