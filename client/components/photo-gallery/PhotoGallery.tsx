import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API, IMG_HOST } from '@/api/api'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import PhotoLightbox from '@/components/photo-lightbox'
import PhotoUploadSection from '@/components/photo-upload-section'
import { concatClassNames as cn } from '@/functions/helpers'
import Container, { ContainerProps } from '@/ui/container'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'
import Spinner from '@/ui/spinner'

const ConfirmationDialog = dynamic(() => import('@/components/confirmation-dialog'), {
    ssr: false
})

interface PhotoGalleryProps extends ContainerProps {
    photos?: Photo[]
    hideActions?: boolean
    uploadingPhotos?: string[]
    onPhotoDelete?: (photos: Photo[]) => void
    onPhotoUploadClick?: () => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    hideActions,
    uploadingPhotos,
    onPhotoDelete,
    onPhotoUploadClick,
    ...props
}) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [deletePhoto, { data: deleteData, isLoading: deleteLoading, error: deleteError }] =
        API.usePhotoDeleteItemMutation()
    const [rotatePhoto, { data: rotateData, isLoading: rotateLoading, error: rotateError }] =
        API.usePhotoRotateItemMutation()

    const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos ?? [])
    const [photoLoadingID, setPhotoLoadingID] = useState<string>()
    const [photoDeleteID, setPhotoDeleteID] = useState<string>()
    const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>()

    const isEmptyPhotoList = useMemo(
        () => !localPhotos.length && !uploadingPhotos?.length,
        [localPhotos.length, !uploadingPhotos?.length]
    )

    const handleRemoveClick = (photoId: string) => {
        if (isAuth && !deleteLoading && !hideActions) {
            setPhotoLoadingID(photoId)
            setPhotoDeleteID(photoId)
        }
    }

    const handleRotateClick = (photoId: string, temporary?: boolean) => {
        if (isAuth && !rotateLoading && !hideActions) {
            setPhotoLoadingID(photoId)
            rotatePhoto({ id: photoId, temporary })
        }
    }

    /**
     * After rotate photo - add time hash for rotated photo
     */
    useEffect(() => {
        const randomString = '?d=' + Math.floor(Date.now() / 1000)

        setLocalPhotos(
            localPhotos.map((photo) => ({
                ...photo,
                full: photo.id === rotateData?.id ? rotateData.full + randomString : photo.full,
                preview: photo.id === rotateData?.id ? rotateData.preview + randomString : photo.preview
            }))
        )

        setPhotoLoadingID(undefined)
    }, [rotateData])

    /**
     * Show errors as notify
     */
    useEffect(() => {
        if (deleteError || rotateError) {
            dispatch(
                Notify({
                    id: 'actionPhotoError',
                    title: '',
                    message: (deleteError as string) || (rotateError as string),
                    type: 'error'
                })
            )
        }
    }, [deleteError, rotateError])

    /**
     *  After deleting a photo, remove it from the local photo list
     */
    React.useEffect(() => {
        const updatedLocalPhotos = localPhotos.filter(({ id }) => id !== deleteData?.id)

        setLocalPhotos(updatedLocalPhotos)
        onPhotoDelete?.(updatedLocalPhotos)
    }, [deleteData])

    useEffect(() => {
        setLocalPhotos(photos ?? [])
    }, [photos])

    return (
        <Container
            {...props}
            className={cn(styles.galleryContainer, props.className)}
        >
            {isEmptyPhotoList && <div className={'emptyList'}>{t('no-photos-here-yet')}</div>}

            {!isEmptyPhotoList && (
                <ul className={cn(styles.photoGallery, (!!props?.title || !!props?.action) && styles.marginTop)}>
                    {onPhotoUploadClick && (
                        <li className={cn(styles.photoItem, styles.photoUpload)}>
                            <PhotoUploadSection onClick={onPhotoUploadClick} />
                        </li>
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
                                title={`${photo.title}. ${t('photo')} ${index + 1}`}
                                onClick={(event) => {
                                    event.preventDefault()
                                    setLightboxPhotoIndex(index)
                                }}
                            >
                                <Image
                                    src={`${IMG_HOST}${photo.preview}`}
                                    alt={`${photo.title}. ${t('photo')} ${index + 1}`}
                                    quality={50}
                                    width={206}
                                    height={150}
                                />
                            </Link>

                            {!hideActions && isAuth && (
                                <Popout
                                    className={styles.actions}
                                    action={<Icon name={'VerticalDots'} />}
                                >
                                    <ul className={styles.actionMenu}>
                                        <li>
                                            <button
                                                onClick={() =>
                                                    handleRotateClick(photo.id, photo?.placeId === 'temporary')
                                                }
                                                disabled={!!photoLoadingID}
                                            >
                                                <Icon name={'Rotate'} /> {t('to-turn')}
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleRemoveClick(photo.id)}
                                                disabled={!!photoLoadingID}
                                            >
                                                <Icon name={'Close'} /> {t('delete')}
                                            </button>
                                        </li>
                                    </ul>
                                </Popout>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <PhotoLightbox
                photos={localPhotos}
                photoIndex={lightboxPhotoIndex}
                showLightbox={typeof lightboxPhotoIndex === 'number'}
                onCloseLightBox={() => setLightboxPhotoIndex(undefined)}
            />

            <ConfirmationDialog
                open={!!photoDeleteID}
                message={`${t('delete-photo')}?`}
                acceptText={t('delete')}
                onReject={() => {
                    setPhotoDeleteID(undefined)
                    setPhotoLoadingID(undefined)
                }}
                onAccept={() => {
                    const photo = photos?.find(({ id }) => id === photoDeleteID)

                    if (photo) {
                        deletePhoto({ id: photo?.id, temporary: photo?.placeId === 'temporary' })
                        setPhotoDeleteID(undefined)
                        setPhotoLoadingID(undefined)
                    }
                }}
            />
        </Container>
    )
}

export default PhotoGallery
