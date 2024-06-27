'use client'

import React from 'react'
import { Marker } from 'react-leaflet'
import Leaflet from 'leaflet'

import styles from './styles.module.sass'

import { IMG_HOST } from '@/api/api'
import { Placemark } from '@/api/types'

type MarkerPhotoProps = {
    photo: Placemark.Photo
    onPhotoClick?: (photos?: Placemark.Photo[], index?: number) => void
}

const MarkerPhoto: React.FC<MarkerPhotoProps> = ({ photo, onPhotoClick }) => {
    const photoMarkerIcon = new Leaflet.Icon({
        className: styles.markerPhoto,
        iconAnchor: [16, 16],
        iconSize: [32, 32],
        iconUrl: `${IMG_HOST}${photo.preview}`
    })

    return (
        <Marker
            position={[photo.lat, photo.lon]}
            icon={photoMarkerIcon}
            title={photo.title}
            alt={photo.title}
            eventHandlers={{
                click: () => {
                    onPhotoClick?.([])
                }
            }}
        />
    )
}

export default MarkerPhoto
