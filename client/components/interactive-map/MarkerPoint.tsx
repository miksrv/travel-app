import Leaflet from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Marker, Popup } from 'react-leaflet'

import Badge from '@/ui/badge'
import Icon from '@/ui/icon'
import RatingColored from '@/ui/rating-colored'
import Skeleton from '@/ui/skeleton'

import { API, IMG_HOST } from '@/api/api'
import { Poi } from '@/api/types'

import BookmarkButton from '@/components/bookmark-button'

import { categoryImage } from '@/functions/categories'
import { addDecimalPoint, numberFormatter } from '@/functions/helpers'

import styles from './styles.module.sass'

interface MarkerPointProps {
    place: Poi.Place
}

const MarkerPoint: React.FC<MarkerPointProps> = ({ place }) => {
    const [getPlaceItem, { isLoading, data: poiData }] =
        API.usePoiGetItemMutation()

    const placeMarkerIcon = new Leaflet.Icon({
        className: styles.markerPoint,
        iconAnchor: [8.4, 19],
        iconSize: [17, 20],
        iconUrl: categoryImage(place.category).src
    })

    const placeClickHandler = () => {
        getPlaceItem(place.id!)
    }

    return (
        <Marker
            position={[place.lat, place.lon]}
            icon={placeMarkerIcon}
            eventHandlers={{
                click: placeClickHandler
            }}
        >
            <Popup
                className={styles.popup}
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

                                {poiData?.cover && (
                                    <Image
                                        className={styles.image}
                                        src={`${IMG_HOST}${poiData.cover?.preview}`}
                                        alt={poiData?.title || ''}
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
                                content={numberFormatter(poiData?.views || 0)}
                            />

                            {!!poiData?.comments && (
                                <div className={styles.icon}>
                                    <Icon name={'Comment'} />
                                    {poiData.comments}
                                </div>
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
                    <h3 className={styles.title}>{poiData?.title}</h3>
                )}
            </Popup>
        </Marker>
    )
}

export default MarkerPoint
