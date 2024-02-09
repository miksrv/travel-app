import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/src/ReactCrop.scss'

import Button from '@/ui/button'
import Dialog from '@/ui/dialog'

import { API } from '@/api/api'
import { openAuthDialog, toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

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
    onSaveCover?: () => void
}

const UserAvatarEditor: React.FC<UserAvatarProps> = ({ onSaveCover }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userAvatarEditor'
    })

    const dispatch = useAppDispatch()

    const inputFile = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const [uploadAvatar, { isLoading: uploadLoading, isSuccess }] =
        API.useUsersPostUploadAvatarMutation()

    const [cropAvatar, { isLoading: cropLoading }] =
        API.useUsersPatchCropAvatarMutation()

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
        !selectedFile

    const handleChangeCoverClick = () => {
        dispatch(toggleOverlay(true))
        setCoverDialogOpen(true)
    }

    const handleCoverDialogClose = () => {
        dispatch(toggleOverlay(false))
        setCoverDialogOpen(false)
        setSelectedFile(undefined)
        setImageSizes(undefined)
    }

    const handleSaveCover = () => {
        if (!imageSizes || !selectedFile || disabled) {
            return
        }

        const formData = new FormData()

        formData.append('avatar', selectedFile)

        uploadAvatar({ formData })
    }

    const handlePhotoUploadClick = () => {
        inputFile.current?.click()
    }

    const handleSelectedFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        setSelectedFile(files?.[0])
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
        if (!imageSizes) {
            return
        }

        cropAvatar({
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
        // handleCoverDialogClose()
        // onSaveCover?.()
    }, [isSuccess])

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
                    {!selectedFile ? (
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
                                src={URL.createObjectURL(selectedFile)}
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
