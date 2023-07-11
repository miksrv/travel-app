import Leaflet from 'leaflet'
import React from 'react'
import { Circle, Marker, Popup } from 'react-leaflet'

import mypointer from '@/public/poi/military_equipment.png'

type TMyPointProps = {
    lat: number
    lon: number
}

const MyPoint: React.FC<TMyPointProps> = ({ lat, lon }) => {
    const myIcon = new Leaflet.Icon({
        iconAnchor: [mypointer.width - 20, mypointer.height - 20],
        iconSize: [mypointer.width - 10, mypointer.height - 12],
        iconUrl: mypointer.src
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
            >
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </>
    )
}

export default MyPoint
