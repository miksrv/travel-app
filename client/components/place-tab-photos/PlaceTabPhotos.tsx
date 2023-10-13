import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import React from 'react'
import Gallery from 'react-photo-gallery'

import { ImageHost } from '@/api/api'
import { Photo } from '@/api/types/Photo'

interface PlaceTabPhotosProps {
    title?: string
    placeId?: string
    photos?: Photo[]
    onPhotoClick?: (index: number) => void
}

const PlaceTabPhotos: React.FC<PlaceTabPhotosProps> = ({
    title,
    placeId,
    photos,
    onPhotoClick
}) => (
    <>
        <CardHeader
            title={title ? `${title} - фотографии` : 'Фотографии'}
            titleTypographyProps={{
                component: 'h2',
                fontSize: 18
            }}
            sx={{ mb: -3 }}
        />
        <CardContent sx={{ mt: 1 }}>
            {photos?.length && placeId ? (
                <Gallery
                    photos={photos?.map((photo) => ({
                        height: photo.height,
                        src: `${ImageHost}photo/${placeId}/${photo.filename}_thumb.${photo.extension}`,
                        width: photo.width
                    }))}
                    onClick={(event, photos) => {
                        onPhotoClick?.(photos.index)
                    }}
                />
            ) : (
                <div>{'Нет фотографий'}</div>
            )}
        </CardContent>
    </>
)

export default PlaceTabPhotos
