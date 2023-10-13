import Leaflet from 'leaflet'
import React from 'react'
import { Marker } from 'react-leaflet'

import { ImageHost } from '@/api/api'
import { Poi } from '@/api/types'

type MarkerPhotoProps = {
    photo: Poi.Photo
}

const MarkerPhoto: React.FC<MarkerPhotoProps> = ({ photo }) => {
    const photoMarkerIcon = new Leaflet.Icon({
        className: 'poiPhoto',
        iconAnchor: [16, 16],
        iconSize: [32, 32],
        iconUrl: `${ImageHost}photo/${photo.place}/${photo.filename}_thumb.${photo.extension}`
    })

    return (
        <Marker
            position={[photo.latitude, photo.longitude]}
            icon={photoMarkerIcon}
            title={photo.title}
        />
    )
}

export default MarkerPhoto
