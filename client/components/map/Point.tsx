import { usePoiGetItemMutation } from '@/api/api'
import Leaflet from 'leaflet'
import Image from 'next/image'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import noPhoto from '@/public/images/nophoto.jpeg'
import icon from '@/public/poi/aircraft.png'

import styles from './styles.module.sass'

type TMyPointProps = {
    id: string
    lat: number
    lon: number
    title?: string
    content?: string
    category?: string
    subcategory?: string
    photo?: string
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
            <Popup className={styles.popup}>
                <Image
                    className={styles.image}
                    src={noPhoto}
                    alt={''}
                    width={300}
                    height={200}
                />
                <div className={styles.title}>
                    {placesLoading ? 'Loading' : data?.title || 'Нет данных'}
                </div>
                {data?.content && (
                    <div className={styles.content}>{data.content}</div>
                )}
            </Popup>
        </Marker>
    )
}

export default Point
