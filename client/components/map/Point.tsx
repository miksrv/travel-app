import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import { API, ImageHost } from '@/api/api'
import { Photo } from '@/api/types/Photo'
import { Categories } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'

import noPhoto from '@/public/images/no-photo-available.png'
import icon from '@/public/images/poi/battlefield.png'

import styles from './styles.module.sass'

type TMyPointProps = {
    lat: number
    lon: number
    category?: Categories
    photo?: string
    placeId?: string
    title?: string
}

const Point: React.FC<TMyPointProps> = (params) => {
    const { placeId, lat, lon, title, category, photo } = params
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

    const myIcon = new Leaflet.Icon({
        className: photo ? 'poiPhoto' : 'poiCategory',
        iconAnchor: photo ? [16, 16] : [icon.width - 20, icon.height - 20],
        iconSize: photo ? [32, 32] : [icon.width - 10, icon.height - 12],
        iconUrl: photo
            ? `${ImageHost}photo/${placeId}/${photo}`
            : categoryImage(category).src
    })

    const placeClickHandler = () => {
        if (placeId && !photo) {
            getPlaceItem(placeId)
        }
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
            {placeId && (
                <Popup className={styles.popup}>
                    {(!isLoading && poiData) || photo ? (
                        <>
                            <Link
                                href={`/places/${placeId}`}
                                title={poiData?.title || title}
                                target={'_blank'}
                            >
                                <Image
                                    className={styles.image}
                                    src={
                                        photo
                                            ? `${ImageHost}photo/${placeId}/${photo}`
                                            : poiData?.photos?.[0]?.filename
                                            ? `${ImageHost}photo/${placeId}/${poiData?.photos?.[0]?.filename}_thumb.${poiData?.photos?.[0]?.extension}`
                                            : noPhoto.src
                                    }
                                    alt={poiData?.title || title}
                                    width={300}
                                    height={200}
                                />
                            </Link>
                            <Typography
                                gutterBottom
                                variant={'body2'}
                                sx={{ m: 0, p: '5px' }}
                            >
                                {poiData?.title || title}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Skeleton
                                sx={{ height: 200, width: 300 }}
                                animation={'wave'}
                                variant={'rectangular'}
                            />
                            <Skeleton
                                animation='wave'
                                height={24}
                                style={{ margin: '5px' }}
                            />
                        </>
                    )}
                </Popup>
            )}
        </Marker>
    )
}

export default Point
