import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/src/ReactCrop.scss'

import Button from '@/ui/button'
import Dialog from '@/ui/dialog'

import { API, IMG_HOST } from '@/api/api'
import { toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

type ImageSizesType = {
    ratioWidth: number
    ratioHeight: number
    realWidth: number
    realHeight: number
    height: number
    width: number
    halfSize: number
    halfRealSize: number
}

interface UserAvatarProps {
    onSaveAvatar?: (filepath: string) => void
}

const UserAvatarEditor: React.FC<UserAvatarProps> = ({ onSaveAvatar }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userAvatarEditor'
    })

    const dispatch = useAppDispatch()

    const inputFile = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const [uploadAvatar, { data: uploadData, isLoading: uploadLoading }] =
        API.useUsersPostUploadAvatarMutation()

    const [cropAvatar, { data: cropData, isLoading: cropLoading, isSuccess }] =
        API.useUsersPatchCropAvatarMutation()

    const [uploadedFile, setUploadedFile] =
        useState<ApiTypes.ResponseUserUploadAvatar>()

    const [coverDialogOpen, setCoverDialogOpen] = useState<boolean>(false)
    const [imageCropData, setImageCropData] = useState<Crop>()
    const [imageSizes, setImageSizes] = useState<ImageSizesType>()
    const [selectedFile, setSelectedFile] = useState<File>()

    const disabled =
        cropLoading ||
        uploadLoading ||
        !imageCropData?.width ||
        !imageCropData?.height ||
        !imageSizes ||
        !uploadedFile

    const handleChangeCoverClick = () => {
        dispatch(toggleOverlay(true))
        setCoverDialogOpen(true)
    }

    const handleCoverDialogClose = () => {
        dispatch(toggleOverlay(false))
        setCoverDialogOpen(false)
        setSelectedFile(undefined)
        setImageSizes(undefined)
        setUploadedFile(undefined)
    }

    const handleSaveCover = () => {
        if (!imageSizes || !uploadedFile || disabled) {
            return
        }

        cropAvatar({
            filename: uploadedFile.filename,
            height: Math.round(
                imageSizes.realHeight * ((imageCropData?.height || 0) / 100)
            ),
            width: Math.round(
                imageSizes.realWidth * ((imageCropData?.width || 0) / 100)
            ),
            x: Math.round(
                imageSizes.realWidth * ((imageCropData?.x || 0) / 100)
            ),
            y: Math.round(
                imageSizes.realHeight * ((imageCropData?.y || 0) / 100)
            )
        })
    }

    const handlePhotoUploadClick = () => {
        inputFile.current?.click()
    }

    const handleSelectedFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (!files?.[0]) {
            return
        }

        const formData = new FormData()

        formData.append('avatar', files[0])

        uploadAvatar({ formData })
    }

    // Выбираем фото для загрузки
    const handleImageLoad = () => {
        if (imageSizes || !imageRef?.current) {
            return
        }

        let sizes = {
            halfRealSize: 0,
            halfSize: 0,
            height: imageRef.current.height,
            ratioHeight: 0,
            ratioWidth: 0,
            realHeight: imageRef.current.naturalHeight,
            realWidth: imageRef.current.naturalWidth,
            width: imageRef.current.width
        }

        sizes.ratioWidth = sizes.realWidth / sizes.width
        sizes.ratioHeight = sizes.realHeight / sizes.height
        sizes.halfSize = Math.min(sizes.width, sizes.height) / 2
        sizes.halfRealSize = Math.min(sizes.realWidth, sizes.realHeight) / 2

        setImageCropData({
            height: (sizes.halfSize / sizes.height) * 100, // 50% of height
            unit: '%',
            width: (sizes.halfSize / sizes.width) * 100, // 50% of width
            x: 25,
            y: 25
        })

        setImageSizes(sizes)
    }

    useEffect(() => {
        handleCoverDialogClose()
        onSaveAvatar?.(cropData?.filepath || '')
    }, [isSuccess])

    // The photo was uploaded to a temporary directory
    useEffect(() => {
        if (uploadData?.filename) {
            setUploadedFile(uploadData)
        }
    }, [uploadData])

    return (
        <>
            <Button
                size={'m'}
                icon={'Photo'}
                mode={'secondary'}
                onClick={handleChangeCoverClick}
            >
                Аватар
            </Button>

            <Dialog
                contentHeight={'500px'}
                maxWidth={'700px'}
                header={
                    !selectedFile
                        ? 'Загрузите фотографию'
                        : 'Отредактируйте и сохраните'
                }
                open={coverDialogOpen}
                showBackLink={!!selectedFile}
                actions={
                    <Button
                        size={'s'}
                        mode={'primary'}
                        onClick={handleSaveCover}
                        disabled={disabled}
                    >
                        Сохранить
                    </Button>
                }
                onBackClick={() => {
                    setSelectedFile(undefined)
                    setImageSizes(undefined)
                }}
                onCloseDialog={handleCoverDialogClose}
            >
                <div className={styles.innerContainer}>
                    {!uploadedFile ? (
                        <>
                            <input
                                ref={inputFile}
                                style={{ display: 'none' }}
                                type={'file'}
                                accept={'image/png, image/gif, image/jpeg'}
                                onChange={handleSelectedFilesUpload}
                            />

                            <Button
                                icon={'Camera'}
                                mode={'primary'}
                                size={'m'}
                                disabled={uploadLoading}
                                onClick={handlePhotoUploadClick}
                            >
                                Загрузить
                            </Button>
                        </>
                    ) : (
                        <ReactCrop
                            circularCrop={true}
                            crop={imageCropData}
                            aspect={1}
                            minHeight={
                                // 50% in px of width
                                imageSizes
                                    ? imageSizes.halfRealSize /
                                      imageSizes.ratioHeight
                                    : 500
                            }
                            minWidth={
                                // 50% in px of height
                                imageSizes
                                    ? imageSizes.halfRealSize /
                                      imageSizes.ratioWidth
                                    : 500
                            }
                            onChange={(c, p) => setImageCropData(p)}
                        >
                            <img
                                ref={imageRef}
                                src={`${IMG_HOST}${uploadedFile.filepath}`}
                                onLoad={handleImageLoad}
                                alt={''}
                                style={{
                                    height: '100%',
                                    objectFit: 'revert-layer',
                                    width: '100%'
                                }}
                            />
                        </ReactCrop>
                    )}
                </div>
            </Dialog>
        </>
    )
}
export default UserAvatarEditor
