import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { IMG_HOST } from '@/api/api'
import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface PhotoGalleryProps {
    photos?: Photo[]
    onPhotoClick?: (index: number) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    onPhotoClick
}) => (
    <ul className={styles.component}>
        {!photos?.length && (
            <div className={styles.emptyList}>{'Нет фотографий'}</div>
        )}
        {photos?.map((photo, index) => (
            <li key={photo.filename}>
                <Link
                    href={`${IMG_HOST}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`}
                    title={`${photo.title}. Посмотреть фото ${index + 1}`}
                    onClick={(event) => {
                        event.preventDefault()
                        onPhotoClick?.(index)
                    }}
                >
                    <Image
                        src={`${IMG_HOST}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`}
                        alt={`${photo.title}, фото ${index + 1}`}
                        width={200}
                        height={150}
                    />
                </Link>
            </li>
        ))}
    </ul>
)

export default PhotoGallery
