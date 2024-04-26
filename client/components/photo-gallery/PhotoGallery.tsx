import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import Spinner from '@/ui/spinner'

import { IMG_HOST } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface PhotoGalleryProps {
    photos?: Photo[]
    showActions?: boolean
    photoLoading?: string
    uploadingPhotos?: string[]
    onPhotoClick?: (index: number) => void
    onPhotoRemoveClick?: (photoId: string) => void
    onPhotoRotateClick?: (photoId: string) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    showActions,
    uploadingPhotos,
    photoLoading,
    onPhotoClick,
    onPhotoRemoveClick,
    onPhotoRotateClick
}) => {
    const user = useAppSelector((state) => state.auth.user)
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
                        width={206}
                        height={150}
                    />
                </li>
            ))}

            {photos?.map((photo, index) => (
                <li
                    key={photo.id}
                    className={styles.photoItem}
                >
                    {photo.id === photoLoading && (
                        <div className={styles.loader}>
                            <Spinner />
                        </div>
                    )}

                    <Link
                        className={styles.link}
                        href={`${IMG_HOST}${photo.full}`}
                        title={`${photo.title}. ${t('linkPhotoTitle')} ${
                            index + 1
                        }`}
                        onClick={(event) => {
                            event.preventDefault()
                            onPhotoClick?.(index)
                        }}
                    >
                        <Image
                            src={`${IMG_HOST}${photo.preview}`}
                            alt={`${photo.title}. ${t('linkPhotoTitle')} ${
                                index + 1
                            }`}
                            quality={50}
                            width={206}
                            height={150}
                        />
                    </Link>

                    {showActions && (
                        <div className={styles.actions}>
                            {user?.id && (
                                <button
                                    onClick={() =>
                                        onPhotoRotateClick?.(photo.id)
                                    }
                                    disabled={!!photoLoading}
                                >
                                    <Icon name={'Rotate'} />
                                </button>
                            )}

                            {user?.id === photo.author?.id && (
                                <button
                                    onClick={() =>
                                        onPhotoRemoveClick?.(photo.id)
                                    }
                                    disabled={!!photoLoading}
                                >
                                    <Icon name={'Close'} />
                                </button>
                            )}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default PhotoGallery
