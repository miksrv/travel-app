import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { IMG_HOST } from '@/api/api'
import { Poi } from '@/api/types'

import styles from './styles.module.sass'

type MarkerPhotoProps = {
    photo: Poi.Photo
    onPhotoClick?: (photo: Poi.Photo) => void
}

const MarkerPhoto: React.FC<MarkerPhotoProps> = ({ photo, onPhotoClick }) => {
    const photoMarkerIcon = new Leaflet.Icon({
        className: styles.markerPhoto,
        iconAnchor: [16, 16],
        iconSize: [32, 32],
        iconUrl: `${IMG_HOST}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`
    })

    return (
        <Marker
            position={[photo.lat, photo.lng]}
            icon={photoMarkerIcon}
            title={''}
            eventHandlers={{
                click: () => {
                    onPhotoClick?.(photo)
                }
            }}
        />
    )
}

export default MarkerPhoto
