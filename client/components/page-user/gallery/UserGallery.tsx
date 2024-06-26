import React from 'react'

import { Photo } from '@/api/types/Photo'
import PhotoGallery from '@/components/photo-gallery'
import Container, { ContainerProps } from '@/ui/container'

interface UserGalleryProps extends Pick<ContainerProps, 'title' | 'action' | 'footer'> {
    photos?: Photo[]
    hideActions?: boolean
}

const UserGallery: React.FC<UserGalleryProps> = ({ photos, hideActions, ...props }) => (
    <Container {...props}>
        <PhotoGallery
            photos={photos}
            hideActions={hideActions}
        />
    </Container>
)

export default UserGallery
