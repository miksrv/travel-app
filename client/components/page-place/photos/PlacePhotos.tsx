import React, { useMemo, useRef, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

import styles from './styles.module.sass'

interface PlacePhotosProps {
    placeId?: string
    photos?: Photo[]
}

const PlacePhotos: React.FC<PlacePhotosProps> = ({ placeId, photos }) => {
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()
    const [localPhotos, setLocalPhotos] = useState<Photo[]>([])
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const inputFile = useRef<HTMLInputElement>(null)

    const { data: actionsData } = API.usePhotosGetActionsQuery(
        { ids: photos?.map(({ id }) => id)?.join(',') },
        { skip: isAuth !== true || !photos?.length }
    )

    const [deletePhoto, { data: deleteData, isLoading: deleteLoading }] =
        API.usePhotoDeleteItemMutation()

    const [
        uploadPhoto,
        {
            data: uploadData,
            isLoading: uploadLoading,
            isSuccess: uploadSuccess,
            isError: uploadError
        }
    ] = API.usePhotoPostUploadMutation()

    const handlePhotoClick = (index: number) => {
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handlePhotoRemoveClick = (photoId: string) => {
        if (isAuth && !deleteLoading) {
            deletePhoto(photoId)
        }
    }

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handlePhotoUploadClick = () => {
        if (isAuth) {
            inputFile.current?.click()
        } else {
            dispatch(openAuthDialog())
        }
    }

    const handleSelectedFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (files?.length) {
            const filesList = Array.from(files).map((file) => file)
            setSelectedFiles(filesList)
        }
    }

    const uploadingPhotos = useMemo(
        () =>
            selectedFiles?.map((file) => URL.createObjectURL(file))?.reverse(),
        [selectedFiles]
    )

    /**
     * If an error occurs in downloading a file, clear the queue of the list of photos for downloading
     * #TODO:Add notification
     */
    React.useEffect(() => {
        setSelectedFiles([])
    }, [uploadError])

    /** After successfully uploading each photo:
     * - remove one file from the download queue
     * - add the uploaded photo to the list of other photos
     */
    React.useEffect(() => {
        if (uploadData) {
            const uploadingFiles = [...selectedFiles]
            uploadingFiles.shift()

            setSelectedFiles(uploadingFiles)
            setLocalPhotos([uploadData, ...localPhotos])
        }
    }, [uploadData])

    /**
     * After each update of the download queue:
     * - perform a request to download the first file from the queue
     */
    React.useEffect(() => {
        if (selectedFiles.length) {
            const formData = new FormData()

            formData.append('photo', selectedFiles[0])

            uploadPhoto({
                count: selectedFiles.length,
                formData,
                place: placeId
            })
        }
    }, [selectedFiles])

    /**
     *  After deleting a photo, remove it from the local photo list
     */
    React.useEffect(() => {
        setLocalPhotos(localPhotos?.filter(({ id }) => id !== deleteData?.id))
    }, [deleteData])

    React.useEffect(() => {
        setSelectedFiles([])
        setLocalPhotos(photos || [])
    }, [placeId])

    return (
        <Container
            className={styles.component}
            title={'Фотографии'}
            action={
                <Button
                    icon={'Camera'}
                    disabled={uploadLoading}
                    onClick={handlePhotoUploadClick}
                >
                    {'Загрузить'}
                </Button>
            }
        >
            <PhotoGallery
                photos={localPhotos}
                actions={actionsData?.items}
                uploadingPhotos={uploadingPhotos}
                onPhotoClick={handlePhotoClick}
                onPhotoRemoveClick={handlePhotoRemoveClick}
            />

            <PhotoLightbox
                photos={localPhotos}
                photoIndex={photoIndex}
                showLightbox={showLightbox}
                onChangeIndex={setPhotoIndex}
                onCloseLightBox={handleCloseLightbox}
            />

            <input
                multiple={true}
                ref={inputFile}
                style={{ display: 'none' }}
                type={'file'}
                accept={'image/png, image/gif, image/jpeg'}
                onChange={handleSelectedFilesUpload}
            />
        </Container>
    )
}

export default PlacePhotos
