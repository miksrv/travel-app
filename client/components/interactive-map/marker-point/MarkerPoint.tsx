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
import { addDecimalPoint, numberFormatter } from '@/functions/helpers'
import Badge from '@/ui/badge'
import RatingColored from '@/ui/rating-colored'
import Skeleton from '@/ui/skeleton'

interface MarkerPointProps {
    place: Placemark.Place
}

const MarkerPoint: React.FC<MarkerPointProps> = ({ place }) => {
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

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
                >
                    <div className={styles.link}>
                        <Link
                            href={`/places/${place.id}`}
                            title={poiData?.title}
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

                                    {poiData.cover && (
                                        <Image
                                            className={styles.image}
                                            src={`${IMG_HOST}${poiData.cover.preview}`}
                                            alt={poiData.title || ''}
                                            width={300}
                                            height={200}
                                        />
                                    )}
                                </>
                            )}
                        </Link>

                        <div
                            className={styles.bottomPanel}
                            style={{
                                opacity: poiData ? 1 : 0
                            }}
                        >
                            <div>
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

                            <div>
                                <BookmarkButton placeId={poiData?.id} />
                            </div>
                        </div>
                    </div>

                    {isLoading || !poiData ? (
                        <Skeleton style={{ height: '18px', margin: '6px' }} />
                    ) : (
                        <h3 className={styles.title}>{poiData.title}</h3>
                    )}
                </Popup>
            )}
        </Marker>
    )
}

export default MarkerPoint
