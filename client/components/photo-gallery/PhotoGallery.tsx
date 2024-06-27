import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API, IMG_HOST } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import ConfirmationDialog from '@/components/confirmation-dialog'
import PhotoLightbox from '@/components/photo-lightbox'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'
import Spinner from '@/ui/spinner'

interface PhotoGalleryProps {
    photos?: Photo[]
    hideActions?: boolean
    uploadingPhotos?: string[]
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, hideActions, uploadingPhotos }) => {
    const user = useAppSelector((state) => state.auth.user)
    const { t } = useTranslation('common', {
        keyPrefix: 'components.photoGallery'
    })

    const [deletePhoto, { data: deleteData, isLoading: deleteLoading }] = API.usePhotoDeleteItemMutation()

    const [rotatePhoto, { data: rotateData, isLoading: rotateLoading }] = API.usePhotoRotateItemMutation()

    const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos ?? [])
    const [photoLoadingID, setPhotoLoadingID] = useState<string>()
    const [photoDeleteID, setPhotoDeleteID] = useState<string>()
    const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>()

    const handleRemoveClick = (photoId: string) => {
        if (user?.id && !deleteLoading && !hideActions) {
            setPhotoLoadingID(photoId)
            setPhotoDeleteID(photoId)
        }
    }

    const handleRotateClick = (photoId: string) => {
        if (user?.id && !rotateLoading && !hideActions) {
            setPhotoLoadingID(photoId)
            rotatePhoto(photoId)
        }
    }

    /**
     * After rotate photo - add time hash for rotated photo
     */
    useEffect(() => {
        setLocalPhotos(
            localPhotos.map((photo) => ({
                ...photo,
                full: photo.id === rotateData?.id ? rotateData.full! : photo.full,
                preview: photo.id === rotateData?.id ? rotateData.preview! : photo.preview
            }))
        )

        setPhotoLoadingID(undefined)
    }, [rotateData])

    /**
     *  After deleting a photo, remove it from the local photo list
     */
    React.useEffect(() => {
        setLocalPhotos(localPhotos.filter(({ id }) => id !== deleteData?.id))
    }, [deleteData])

    useEffect(() => {
        setLocalPhotos(photos ?? [])
    }, [photos])

    return (
        <>
            {!localPhotos.length && !uploadingPhotos?.length && <div className={styles.emptyList}>{t('noPhotos')}</div>}

            <ul className={styles.photoGallery}>
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

                {localPhotos.map((photo, index) => (
                    <li
                        key={photo.id}
                        className={styles.photoItem}
                    >
                        {photo.id === photoLoadingID && (
                            <div className={styles.loader}>
                                <Spinner />
                            </div>
                        )}

                        <Link
                            className={styles.link}
                            href={`${IMG_HOST}${photo.full}`}
                            title={`${photo.title}. ${t('linkPhotoTitle')} ${index + 1}`}
                            onClick={(event) => {
                                event.preventDefault()
                                setLightboxPhotoIndex(index)
                            }}
                        >
                            <Image
                                src={`${IMG_HOST}${photo.preview}`}
                                alt={`${photo.title}. ${t('linkPhotoTitle')} ${index + 1}`}
                                quality={50}
                                width={206}
                                height={150}
                            />
                        </Link>

                        {!hideActions && (
                            <Popout
                                className={styles.actions}
                                action={<Icon name={'VerticalDots'} />}
                            >
                                <ul className={styles.actionMenu}>
                                    <li>
                                        <button
                                            onClick={() => handleRotateClick(photo.id)}
                                            disabled={!!photoLoadingID}
                                        >
                                            <Icon name={'Rotate'} /> {t('actionRotate')}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleRemoveClick(photo.id)}
                                            disabled={!!photoLoadingID}
                                        >
                                            <Icon name={'Close'} /> {t('actionDelete')}
                                        </button>
                                    </li>
                                </ul>
                            </Popout>
                        )}
                    </li>
                ))}
            </ul>

            <PhotoLightbox
                photos={localPhotos}
                photoIndex={lightboxPhotoIndex}
                showLightbox={typeof lightboxPhotoIndex === 'number'}
                onCloseLightBox={() => setLightboxPhotoIndex(undefined)}
            />

            <ConfirmationDialog
                open={!!photoDeleteID}
                message={t('acceptConfirmMessage')}
                acceptText={t('acceptConfirmDelete')}
                onReject={() => {
                    setPhotoDeleteID(undefined)
                    setPhotoLoadingID(undefined)
                }}
                onAccept={() => {
                    if (photoDeleteID) {
                        deletePhoto(photoDeleteID)
                        setPhotoDeleteID(undefined)
                        setPhotoLoadingID(undefined)
                    }
                }}
            />
        </>
    )
}

export default PhotoGallery
