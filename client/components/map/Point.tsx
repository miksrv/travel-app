import { usePoiGetItemMutation } from '@/api/api'
import Leaflet from 'leaflet'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import icon from '@/public/icons/memorial.png'

type TMyPointProps = {
    id: string
    lat: number
    lon: number
    title?: string
    category?: string
}

const Point: React.FC<TMyPointProps> = ({ id, lat, lon, title, category }) => {
    const [getPlaceItem, { isLoading: placesLoading, data }] =
        usePoiGetItemMutation()

    const myIcon = new Leaflet.Icon({
        iconAnchor: [icon.width - 20, icon.height - 20],
        iconSize: [icon.width - 10, icon.height - 12],
        iconUrl: category ? `/poi/${category}.png` : icon.src
        // popupAnchor: [-3, -76],
        // shadowAnchor: [22, 94],
        // shadowSize: [68, 95],
        // shadowUrl: 'my-icon-shadow.png'
    })

    const placeClickHandler = () => {
        getPlaceItem(id)
    }

    return (
        <Marker
            title={title}
            position={[lat, lon]}
            icon={myIcon}
            eventHandlers={{
                click: placeClickHandler
            }}
        >
            <Popup>{placesLoading ? 'Loading' : data?.title}</Popup>
        </Marker>
    )
}

export default Point
