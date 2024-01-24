import React, { useState } from 'react'

import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

interface UserGalleryProps {
    photos?: Photo[]
}

const UserGallery: React.FC<UserGalleryProps> = ({ photos }) => {
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
        </>
    )
}

export default UserGallery
