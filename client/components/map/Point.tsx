import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
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
    category: Categories
    lat: number
    lon: number
    placeId?: string
    title?: string
    photo?: string
}

const Point: React.FC<TMyPointProps> = ({
    placeId,
    lat,
    lon,
    title,
    category
}) => {
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

    const myIcon = new Leaflet.Icon({
        iconAnchor: [icon.width - 20, icon.height - 20],
        iconSize: [icon.width - 10, icon.height - 12],
        iconUrl: categoryImage(category).src
    })

    const placeClickHandler = () => {
        if (placeId) {
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
                    {!isLoading && poiData ? (
                        <>
                            <Link
                                href={`/places/${poiData?.id}`}
                                title={poiData?.title}
                                target={'_blank'}
                            >
                                <Image
                                    className={styles.image}
                                    src={
                                        poiData?.photos?.[0]?.filename
                                            ? `${ImageHost}/photos/${placeId}/${poiData?.photos?.[0]?.filename}_thumb.${poiData?.photos?.[0]?.extension}`
                                            : noPhoto.src
                                    }
                                    alt={poiData?.title || ''}
                                    width={300}
                                    height={200}
                                />
                            </Link>
                            <Typography
                                gutterBottom
                                variant={'body2'}
                                sx={{ m: 0, p: '5px' }}
                            >
                                {poiData?.title}
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
