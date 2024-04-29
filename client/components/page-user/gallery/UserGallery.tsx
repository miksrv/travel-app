import React from 'react'

import Container, { ContainerProps } from '@/ui/container'

import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'

interface UserGalleryProps extends Pick<ContainerProps, 'title' | 'footer'> {
    photos?: Photo[]
    hideActions?: boolean
}

const UserGallery: React.FC<UserGalleryProps> = ({
    photos,
    hideActions,
    ...props
}) => (
    <Container {...props}>
        <PhotoGallery
            photos={photos}
            hideActions={hideActions}
        />
    </Container>
)

export default UserGallery
