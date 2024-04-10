'use client'

import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { APIPastvu } from '@/api/apiPastvu'
import { Placemark } from '@/api/types'

import { MapPositionType } from '@/components/interactive-map/InteractiveMap'

import styles from './styles.module.sass'

type HistoricalPhotosProps = {
    position?: MapPositionType
    onPhotoClick?: (photo: Placemark.Photo) => void
}

const IMG_HOST = 'https://pastvu.com/_p'

const HistoricalPhotos: React.FC<HistoricalPhotosProps> = ({
    position,
    onPhotoClick
}) => {
    const { data: photosData } = APIPastvu.useNearestGetPhotosQuery(
        {
            lat: position?.lat!,
            lon: position?.lon!
        },
        { skip: !position?.lat || !position?.lon }
    )

    const photoUrl = (file: string, full?: boolean) =>
        `${IMG_HOST}/${full ? 'a' : 'h'}/${file}`

    return photosData?.result?.photos?.length ? (
        photosData?.result?.photos?.map((photo) => (
            <Marker
                key={photo?.cid}
                position={[photo.geo[0], photo.geo[1]]}
                icon={
                    new Leaflet.Icon({
                        className: styles.historicalPhoto,
                        iconAnchor: [25, 16],
                        iconSize: [50, 32],
                        iconUrl: photoUrl(photo.file)
                    })
                }
                title={photo.title}
                alt={photo.title}
                eventHandlers={{
                    click: () => {
                        onPhotoClick?.({
                            full: photoUrl(photo.file, true),
                            lat: photo.geo[0],
                            lon: photo.geo[1],
                            preview: photoUrl(photo.file),
                            title: `${photo.title}${
                                photo.year ? ` (${photo.year})` : ''
                            }`
                        })
                    }
                }}
            />
        ))
    ) : (
        <></>
    )
}

export default HistoricalPhotos
