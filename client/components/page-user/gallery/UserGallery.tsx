import React, { useState } from 'react'

import Container, { ContainerProps } from '@/ui/container'

import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

interface UserGalleryProps extends Pick<ContainerProps, 'title' | 'footer'> {
    photos?: Photo[]
}

const UserGallery: React.FC<UserGalleryProps> = ({ photos, ...props }) => {
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
        <Container {...props}>
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
        </Container>
    )
}

export default UserGallery
