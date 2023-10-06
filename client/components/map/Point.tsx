import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import { API, ImageHost } from '@/api/api'
import { Categories } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'

import noPhoto from '@/public/images/no-photo-available.png'
import icon from '@/public/poi/battlefield.png'

import styles from './styles.module.sass'

type TMyPointProps = {
    id: string
    lat: number
    lon: number
    title?: string
    category: Categories
    photo?: string
}

const Point: React.FC<TMyPointProps> = ({ id, lat, lon, title, category }) => {
    const [getPlaceItem, { isLoading: placesLoading, data }] =
        API.usePoiGetItemMutation()

    const myIcon = new Leaflet.Icon({
        iconAnchor: [icon.width - 20, icon.height - 20],
        iconSize: [icon.width - 10, icon.height - 12],
        iconUrl: categoryImage(category).src
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
                <Link
                    href={`/places/${data?.id}`}
                    title={data?.title}
                    target={'_blank'}
                >
                    <Image
                        className={styles.image}
                        src={
                            data?.photos?.[0]?.filename
                                ? `${ImageHost}/photos/${id}/${data?.photos?.[0]?.filename}_thumb.${data?.photos?.[0]?.extension}`
                                : noPhoto.src
                        }
                        alt={data?.title}
                        width={300}
                        height={200}
                    />
                </Link>
                <div className={styles.title}>
                    {placesLoading ? 'Loading' : data?.title || 'Нет данных'}
                </div>
            </Popup>
        </Marker>
    )
}

export default Point
