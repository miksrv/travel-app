import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import { API, ImageHost } from '@/api/api'
import { Poi } from '@/api/types'

import { categoryImage } from '@/functions/categories'

import noPhoto from '@/public/images/no-photo-available.png'
import icon from '@/public/images/poi/battlefield.png'

import styles from './styles.module.sass'

type MarkerPointProps = {
    place: Poi.Place
}

const MarkerPoint: React.FC<MarkerPointProps> = ({ place }) => {
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

    const placeMarkerIcon = new Leaflet.Icon({
        className: styles.markerPoint,
        iconAnchor: [icon.width - 20, icon.height - 20],
        iconSize: [icon.width - 10, icon.height - 12],
        iconUrl: categoryImage(place.category).src
    })

    const placeClickHandler = () => {
        if (place.id) {
            getPlaceItem(place.id)
        }
    }

    return (
        <Marker
            position={[place.latitude, place.longitude]}
            icon={placeMarkerIcon}
            eventHandlers={{
                click: placeClickHandler
            }}
        >
            {place.id && (
                <Popup className={styles.popup}>
                    {!isLoading && poiData ? (
                        <>
                            <Link
                                href={`/places/${place.id}`}
                                title={poiData?.title}
                            >
                                <Image
                                    className={styles.image}
                                    src={
                                        poiData?.photos?.[0]?.filename
                                            ? `${ImageHost}photo/${place.id}/${poiData?.photos?.[0]?.filename}_thumb.${poiData?.photos?.[0]?.extension}`
                                            : noPhoto.src
                                    }
                                    alt={poiData?.title}
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

export default MarkerPoint