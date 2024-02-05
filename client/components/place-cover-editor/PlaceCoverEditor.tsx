import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'

import Button from '@/ui/button'
import Dialog from '@/ui/dialog'

import { API, IMG_HOST } from '@/api/api'
import { openAuthDialog, toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface PlaceCoverEditorProps {
    placeId?: string
    photos?: Photo[]
}

const PlaceCoverEditor: React.FC<PlaceCoverEditorProps> = ({
    placeId,
    photos
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placeCoverEditor'
    })

    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)

    const [updateCover, { isLoading, isSuccess }] =
        API.usePlacesPatchCoverMutation()

    const [heightRatio, setHeightRatio] = useState<number>(1)
    const [widthRatio, setWidthRatio] = useState<number>(1)

    const [coverDialogOpen, setCoverDialogOpen] = useState<boolean>(false)
    const [selectedPhotoId, setSelectedPhotoId] = useState<string>('')
    const [imageCropData, setImageCropData] = useState<Crop>()

    const selectedPhoto = useMemo(
        () => photos?.find(({ id }) => id === selectedPhotoId),
        [selectedPhotoId]
    )

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
        if (!selectedPhoto?.width || !selectedPhoto?.height) {
            return
        }

        updateCover({
            height: Math.round(
                selectedPhoto.height * ((imageCropData?.height || 0) / 100)
            ),
            photoId: selectedPhotoId!,
            placeId: placeId!,
            width: Math.round(
                selectedPhoto.width * ((imageCropData?.width || 0) / 100)
            ),
            x: Math.round(
                selectedPhoto.width * ((imageCropData?.x || 0) / 100)
            ),
            y: Math.round(
                selectedPhoto.height * ((imageCropData?.y || 0) / 100)
            )
        })
    }

    const handleImageLoad = (e: any) => {
        const { width, height } = e.currentTarget

        const ratioW = selectedPhoto?.width ? selectedPhoto.width / width : 1
        const ratioH = selectedPhoto?.height ? selectedPhoto.height / height : 1

        setWidthRatio(ratioW)
        setHeightRatio(ratioH)

        setImageCropData({
            height: 300 / ratioH,
            unit: 'px',
            width: 870 / ratioW,
            x: 0,
            y: 0
        })
    }

    useEffect(() => {
        handleCoverDialogClose()
    }, [isSuccess])

    return (
        <>
            <Button
                size={'m'}
                icon={'Photo'}
                mode={'secondary'}
                onClick={handleChangeCoverClick}
            >
                Обложка
            </Button>

            <Dialog
                contentHeight={'600px'}
                maxWidth={'800px'}
                header={
                    !selectedPhotoId
                        ? 'Выберите фотографию'
                        : 'Сохраните новую обложку'
                }
                open={coverDialogOpen}
                showBackLink={!!selectedPhotoId}
                actions={
                    selectedPhoto && (
                        <Button
                            size={'s'}
                            mode={'primary'}
                            onClick={handleSaveCover}
                            disabled={isLoading || isSuccess}
                        >
                            Сохранить
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
                        {photos?.map((photo) => (
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
                    </ul>
                ) : (
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
                )}
            </Dialog>
        </>
    )
}
export default PlaceCoverEditor
