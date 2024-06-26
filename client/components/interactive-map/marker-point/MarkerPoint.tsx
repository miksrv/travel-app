'use client'

import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'

import styles from './styles.module.sass'

import { API, IMG_HOST } from '@/api/api'
import { Placemark } from '@/api/types'
import BookmarkButton from '@/components/bookmark-button'
import { categoryImage } from '@/functions/categories'
import { addDecimalPoint } from '@/functions/helpers'
import Badge from '@/ui/badge'
import Skeleton from '@/ui/skeleton'

interface MarkerPointProps {
    place: Placemark.Place
}

const MarkerPoint: React.FC<MarkerPointProps> = ({ place }) => {
    const [getPlaceItem, { isLoading, data: poiData }] = API.usePoiGetItemMutation()

    const placeMarkerIcon = new Leaflet.Icon({
        iconAnchor: [8.4, 19],
        iconSize: [17, 20],
        iconUrl: categoryImage(place.category).src
    })

    const placeClickHandler = () => {
        if (place.id) {
            getPlaceItem(place.id!)
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
                <Popup
                    className={styles.markerPointPopup}
                    closeOnEscapeKey={true}
                    autoPan={false}
                    keepInView={false}
                    autoClose={true}
                >
                    <div className={styles.content}>
                        <Link
                            href={`/places/${place.id}`}
                            title={poiData?.title}
                        >
                            {(isLoading || !poiData) && <Skeleton />}

                            {!isLoading && poiData && poiData?.cover && (
                                <Image
                                    className={styles.image}
                                    src={`${IMG_HOST}${poiData.cover.preview}`}
                                    alt={poiData.title || ''}
                                    width={300}
                                    height={220}
                                />
                            )}
                        </Link>

                        <div className={styles.bookmarkButton}>
                            <BookmarkButton placeId={poiData?.id} />
                        </div>

                        <div
                            className={styles.bottomPanel}
                            style={{
                                opacity: poiData ? 1 : 0
                            }}
                        >
                            <div className={styles.iconsPanel}>
                                {!!poiData?.rating && (
                                    <Badge
                                        icon={'Star'}
                                        content={addDecimalPoint(poiData.rating)}
                                    />
                                )}

                                {!!poiData?.comments && (
                                    <Badge
                                        icon={'Comment'}
                                        content={poiData.comments}
                                    />
                                )}

                                {!!poiData?.bookmarks && (
                                    <Badge
                                        icon={'HeartEmpty'}
                                        content={poiData.bookmarks}
                                    />
                                )}
                            </div>

                            <h3 className={styles.title}>{poiData?.title}</h3>
                        </div>
                    </div>
                </Popup>
            )}
        </Marker>
    )
}

export default MarkerPoint
