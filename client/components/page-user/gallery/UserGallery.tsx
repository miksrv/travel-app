import React from 'react'

import Container, { ContainerProps } from '@/ui/container'

import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'

interface UserGalleryProps extends Pick<ContainerProps, 'title' | 'footer'> {
    photos?: Photo[]
}

const UserGallery: React.FC<UserGalleryProps> = ({ photos, ...props }) => (
    <Container {...props}>
        <PhotoGallery photos={photos} />
    </Container>
)

export default UserGallery
