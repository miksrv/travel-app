import React, { useEffect, useMemo, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import 'react-image-crop/src/ReactCrop.scss'

import styles from './styles.module.sass'

import { API, IMG_HOST } from '@/api/api'
import { openAuthDialog, toggleOverlay } from '@/api/applicationSlice'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import Button from '@/ui/button'
import Dialog from '@/ui/dialog'

interface PlaceCoverEditorProps {
    placeId?: string
    onSaveCover?: () => void
}

const PlaceCoverEditor: React.FC<PlaceCoverEditorProps> = ({ placeId, onSaveCover }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placeCoverEditor'
    })

    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)

    const { data: photosData, isLoading: photoLoading } = API.usePhotosGetListQuery({ place: placeId })

    const [updateCover, { isLoading, isSuccess, isError, error }] = API.usePlacesPatchCoverMutation()

    const [heightRatio, setHeightRatio] = useState<number>(1)
    const [widthRatio, setWidthRatio] = useState<number>(1)

    const [coverDialogOpen, setCoverDialogOpen] = useState<boolean>(false)
    const [selectedPhotoId, setSelectedPhotoId] = useState<string>('')
    const [imageCropData, setImageCropData] = useState<Crop>()

    const selectedPhoto = useMemo(() => photosData?.items?.find(({ id }) => id === selectedPhotoId), [selectedPhotoId])

    const disabled = isLoading || !imageCropData?.width || !imageCropData.height

    const handleChangeCoverClick = (event: React.MouseEvent) => {
        if (!authSlice.isAuth) {
            event.stopPropagation()
            dispatch(openAuthDialog())
        } else {
            dispatch(toggleOverlay(true))
            setCoverDialogOpen(true)
        }
    }

    const handleCoverDialogClose = () => {
        dispatch(toggleOverlay(false))
        setCoverDialogOpen(false)
        setSelectedPhotoId('')
    }

    const handleSaveCover = () => {
        if (!selectedPhoto?.width || !selectedPhoto.height || disabled) {
            return
        }

        updateCover({
            height: Math.round(selectedPhoto.height * ((imageCropData.height || 0) / 100)),
            photoId: selectedPhotoId!,
            placeId: placeId!,
            width: Math.round(selectedPhoto.width * ((imageCropData.width || 0) / 100)),
            x: Math.round(selectedPhoto.width * ((imageCropData.x || 0) / 100)),
            y: Math.round(selectedPhoto.height * ((imageCropData.y || 0) / 100))
        })
    }

    const handleImageLoad = (e: any) => {
        const { width, height } = e.currentTarget

        if (!selectedPhoto?.height || !selectedPhoto.width) {
            return
        }

        const ratioW = selectedPhoto.width ? selectedPhoto.width / width : 1
        const ratioH = selectedPhoto.height ? selectedPhoto.height / height : 1

        setWidthRatio(ratioW)
        setHeightRatio(ratioH)

        const newHeight = (width / 870) * 300

        setImageCropData({
            height: (newHeight / height) * 100,
            unit: '%',
            width: 100,
            x: 0,
            y: 0
        })
    }

    useEffect(() => {
        handleCoverDialogClose()
        onSaveCover?.()
    }, [isSuccess])

    useEffect(() => {
        if (error) {
            dispatch(
                Notify({
                    id: 'placeCoverEditor',
                    message: error as string,
                    type: 'error'
                })
            )
        }
    }, [isError, error])

    return (
        <>
            <Button
                size={'medium'}
                icon={'Photo'}
                mode={'secondary'}
                onClick={handleChangeCoverClick}
            >
                {t('buttonCover')}
            </Button>

            <Dialog
                contentHeight={'490px'}
                maxWidth={'700px'}
                header={!selectedPhotoId ? t('selectPhoto') : t('saveNewCover')}
                open={coverDialogOpen}
                showBackLink={!!selectedPhotoId}
                actions={
                    selectedPhoto && (
                        <Button
                            size={'small'}
                            mode={'primary'}
                            onClick={handleSaveCover}
                            disabled={disabled}
                        >
                            {t('buttonSave')}
                        </Button>
                    )
                }
                onBackClick={() => {
                    setSelectedPhotoId('')
                }}
                onCloseDialog={handleCoverDialogClose}
            >
                {!selectedPhotoId ? (
                    <ul className={styles.coverPhotosList}>
                        {photosData?.items?.map((photo) => (
                            <li key={`coverDialog${photo.id}`}>
                                <Image
                                    src={`${IMG_HOST}${photo.preview}`}
                                    alt={''}
                                    width={200}
                                    height={150}
                                    onClick={() => {
                                        setSelectedPhotoId(photo.id)
                                    }}
                                />
                            </li>
                        ))}
                        {!photoLoading && !photosData?.items?.length && (
                            <div className={styles.noPhotos}>{t('noPhotos')}</div>
                        )}
                    </ul>
                ) : (
                    <div className={styles.innerContainer}>
                        <ReactCrop
                            crop={imageCropData}
                            aspect={870 / 300}
                            minWidth={870 / widthRatio}
                            minHeight={300 / heightRatio}
                            onChange={(c, p) => setImageCropData(p)}
                        >
                            <img
                                src={`${IMG_HOST}${selectedPhoto?.full}`}
                                onLoad={handleImageLoad}
                                alt={''}
                                style={{
                                    height: '100%',
                                    objectFit: 'cover',
                                    width: '100%'
                                }}
                            />
                        </ReactCrop>
                    </div>
                )}
            </Dialog>
        </>
    )
}
export default PlaceCoverEditor
