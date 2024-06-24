import React, { useEffect, useRef, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import { useTranslation } from 'next-i18next'

import 'react-image-crop/src/ReactCrop.scss'

import styles from './styles.module.sass'

import { API, IMG_HOST } from '@/api/api'
import { toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'
import Button from '@/ui/button'
import Dialog from '@/ui/dialog'
import Spinner from '@/ui/spinner'

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

    const disabled =
        cropLoading ||
        uploadLoading ||
        !imageCropData?.width ||
        !imageCropData.height ||
        !imageSizes ||
        !uploadedFile

    const handleChangeCoverClick = () => {
        dispatch(toggleOverlay(true))
        setCoverDialogOpen(true)
    }

    const handleCoverDialogClose = () => {
        dispatch(toggleOverlay(false))
        setCoverDialogOpen(false)
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
                imageSizes.realHeight * ((imageCropData.height || 0) / 100)
            ),
            width: Math.round(
                imageSizes.realWidth * ((imageCropData.width || 0) / 100)
            ),
            x: Math.round(
                imageSizes.realWidth * ((imageCropData.x || 0) / 100)
            ),
            y: Math.round(
                imageSizes.realHeight * ((imageCropData.y || 0) / 100)
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

    // Select a photo to upload
    const handleImageLoad = () => {
        if (imageSizes || !imageRef.current) {
            return
        }

        const sizes = {
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
        sizes.halfSize = Math.min(sizes.width, sizes.height)
        sizes.halfRealSize = Math.min(sizes.realWidth, sizes.realHeight)

        setImageCropData({
            height: (sizes.halfSize / sizes.height) * 100, // 50% of height
            unit: '%',
            width: (sizes.halfSize / sizes.width) * 100, // 50% of width
            x: 0,
            y: 0
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
                size={'medium'}
                icon={'Photo'}
                mode={'secondary'}
                onClick={handleChangeCoverClick}
            >
                {t('buttonAvatar')}
            </Button>

            <Dialog
                contentHeight={'500px'}
                maxWidth={'700px'}
                header={
                    !uploadedFile
                        ? t('dialogTitleUpload')
                        : t('dialogTitleSave')
                }
                open={coverDialogOpen}
                showBackLink={!!uploadedFile}
                actions={
                    <Button
                        size={'small'}
                        mode={'primary'}
                        onClick={handleSaveCover}
                        disabled={disabled}
                    >
                        {t('buttonSave')}
                    </Button>
                }
                onBackClick={() => {
                    setUploadedFile(undefined)
                    setImageSizes(undefined)
                }}
                onCloseDialog={handleCoverDialogClose}
            >
                {!uploadLoading ? (
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
                                    size={'medium'}
                                    disabled={uploadLoading}
                                    onClick={handlePhotoUploadClick}
                                >
                                    {t('buttonUpload')}
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
                                          2 /
                                          imageSizes.ratioHeight
                                        : 500
                                }
                                minWidth={
                                    // 50% in px of height
                                    imageSizes
                                        ? imageSizes.halfRealSize /
                                          2 /
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
                                        height: '100%'
                                    }}
                                />
                            </ReactCrop>
                        )}
                    </div>
                ) : (
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                )}
            </Dialog>
        </>
    )
}
export default UserAvatarEditor
