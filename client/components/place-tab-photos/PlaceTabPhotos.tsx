import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import React, { useState } from 'react'

import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

interface PlaceTabPhotosProps {
    title?: string
    photos?: Photo[]
}

const PlaceTabPhotos: React.FC<PlaceTabPhotosProps> = ({ title, photos }) => {
    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()

    const handlePhotoClick = (index: number) => {
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    return (
        <>
            <CardHeader
                title={title ? `${title} - фотографии` : 'Фотографии'}
                titleTypographyProps={{
                    component: 'h2',
                    fontSize: 18
                }}
                sx={{ mb: -2 }}
            />
            <CardContent sx={{ mb: -1 }}>
                <PhotoGallery
                    photos={photos}
                    onPhotoClick={handlePhotoClick}
                />
                <PhotoLightbox
                    photos={photos}
                    photoIndex={photoIndex}
                    showLightbox={showLightbox}
                    onChangeIndex={setPhotoIndex}
                    onCloseLightBox={handleCloseLightbox}
                />
            </CardContent>
        </>
    )
}

export default PlaceTabPhotos
