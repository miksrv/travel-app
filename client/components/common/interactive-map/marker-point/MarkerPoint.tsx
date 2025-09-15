'use client'

import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import Leaflet from 'leaflet'
import { Skeleton } from 'simple-react-ui-kit'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { API, ApiModel, IMG_HOST } from '@/api'
import { BookmarkButton } from '@/components/common'
import { categoryImage } from '@/functions/categories'
import { addDecimalPoint, numberFormatter } from '@/functions/helpers'
import PlacePlate from '@/ui/place-plate'

import styles from './styles.module.sass'

interface MarkerPointProps {
    place: ApiModel.PlaceMark
    keepInView?: boolean
}

export const MarkerPoint: React.FC<MarkerPointProps> = ({ place, keepInView }) => {
    const { t } = useTranslation('common')

    const [getPlaceItem, { isLoading, data: poiData }] = API.usePoiGetItemMutation()

    const placeMarkerIcon = new Leaflet.Icon({
        iconAnchor: [8.4, 19],
        iconSize: [17, 20],
        iconUrl: categoryImage(place.category).src
    })

    const placeClickHandler = async () => {
        if (place.id) {
            await getPlaceItem(place.id!)
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
                    autoClose={true}
                    closeOnEscapeKey={true}
                    autoPan={keepInView}
                    keepInView={keepInView}
                    className={styles.markerPointPopup}
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
                                    <PlacePlate
                                        icon={'StarEmpty'}
                                        content={addDecimalPoint(poiData.rating)}
                                    />
                                )}

                                {!!poiData?.comments && (
                                    <PlacePlate
                                        icon={'Comment'}
                                        content={poiData.comments}
                                    />
                                )}

                                {!!poiData?.bookmarks && (
                                    <PlacePlate
                                        icon={'HeartEmpty'}
                                        content={poiData.bookmarks}
                                    />
                                )}

                                {!!poiData?.distance && (
                                    <PlacePlate
                                        icon={'Ruler'}
                                        content={
                                            numberFormatter(poiData.distance) + ' ' + t('km', { defaultValue: 'км' })
                                        }
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
