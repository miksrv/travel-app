import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import Spinner from '@/ui/spinner'

import { IMG_HOST } from '@/api/api'
import { ApiTypes } from '@/api/types'
import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface PhotoGalleryProps {
    photos?: Photo[]
    actions?: ApiTypes.ItemActionType[]
    uploadingPhotos?: string[]
    onPhotoClick?: (index: number) => void
    onPhotoRemoveClick?: (photoId: string) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    uploadingPhotos,
    actions,
    onPhotoClick,
    onPhotoRemoveClick
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.photoGallery'
    })

    return (
        <ul className={styles.photoGallery}>
            {!photos?.length && !uploadingPhotos?.length && (
                <div className={styles.emptyList}>{t('noPhotos')}</div>
            )}

            {uploadingPhotos?.map((photo) => (
                <li
                    key={photo}
                    className={styles.photoItem}
                >
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                    <Image
                        src={photo}
                        alt={''}
                        width={200}
                        height={150}
                    />
                </li>
            ))}

            {photos?.map((photo, index) => (
                <li
                    key={photo.filename}
                    className={styles.photoItem}
                >
                    <Link
                        className={styles.photoLink}
                        href={`${IMG_HOST}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`}
                        title={`${photo.title}. ${t('linkPhotoTitle')} ${
                            index + 1
                        }`}
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
                    {actions?.find(({ id }) => id === photo.id)?.remove && (
                        <button
                            className={styles.removeButton}
                            onClick={() => onPhotoRemoveClick?.(photo.id)}
                        >
                            <Icon name={'Close'} />
                        </button>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default PhotoGallery
