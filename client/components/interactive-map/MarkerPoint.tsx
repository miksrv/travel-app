import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import Badge from '@/ui/badge'
import RatingColored from '@/ui/rating-colored'
import Skeleton from '@/ui/skeleton'

import { API, IMG_HOST } from '@/api/api'
import { Poi } from '@/api/types'

import { categoryImage } from '@/functions/categories'
import { addDecimalPoint, numberFormatter } from '@/functions/helpers'

import styles from './styles.module.sass'

type MarkerPointProps = {
    place: Poi.Place
}

const MarkerPoint: React.FC<MarkerPointProps> = ({ place }) => {
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

    const placeMarkerIcon = new Leaflet.Icon({
        className: styles.markerPoint,
        iconAnchor: [9, 30],
        iconSize: [17, 20],
        iconUrl: categoryImage(place.category).src
    })

    const placeClickHandler = () => {
        if (place.id) {
            getPlaceItem(place.id)
        }
    }

    return (
        <Marker
            position={[place.lat, place.lon]}
            icon={placeMarkerIcon}
            eventHandlers={{
                click: placeClickHandler
            }}
        >
            {place.id && (
                <Popup className={styles.popup}>
                    <Link
                        href={`/places/${place.id}`}
                        title={poiData?.title}
                        className={styles.link}
                    >
                        {(isLoading || !poiData) && <Skeleton />}

                        {!isLoading && poiData && (
                            <>
                                <RatingColored
                                    className={styles.rating}
                                    value={poiData.rating}
                                >
                                    {addDecimalPoint(poiData.rating)}
                                </RatingColored>
                                <Image
                                    className={styles.image}
                                    src={`${IMG_HOST}${poiData?.cover?.preview}`}
                                    alt={poiData?.title || ''}
                                    width={300}
                                    height={200}
                                />
                                <div className={styles.bottomPanel}>
                                    <Badge
                                        icon={'Photo'}
                                        content={poiData?.photos || 0}
                                    />
                                    <Badge
                                        icon={'Eye'}
                                        content={numberFormatter(
                                            poiData?.views || 0
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </Link>
                    {isLoading || !poiData ? (
                        <Skeleton style={{ height: '18px', margin: '6px' }} />
                    ) : (
                        <h3 className={styles.title}>{poiData?.title}</h3>
                    )}
                </Popup>
            )}
        </Marker>
    )
}

export default MarkerPoint
