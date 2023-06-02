import Leaflet from 'leaflet'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import icon from '@/public/icons/memorial.png'

type TMyPointProps = {
    lat: number
    lon: number
    title?: string
}

const Point: React.FC<TMyPointProps> = ({ lat, lon, title }) => {
    const myIcon = new Leaflet.Icon({
        iconAnchor: [icon.width - 20, icon.height - 20],
        iconSize: [icon.width - 10, icon.height - 12],
        iconUrl: icon.src
        // popupAnchor: [-3, -76],
        // shadowAnchor: [22, 94],
        // shadowSize: [68, 95],
        // shadowUrl: 'my-icon-shadow.png'
    })

    return (
        <Marker
            position={[lat, lon]}
            icon={myIcon}
        >
            <Popup>{title}</Popup>
        </Marker>
    )
}

export default Point
