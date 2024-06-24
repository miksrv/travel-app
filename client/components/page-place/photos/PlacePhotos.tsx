import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import PhotoGallery from '@/components/photo-gallery'
import Button from '@/ui/button'
import Container from '@/ui/container'

interface PlacePhotosProps {
    placeId?: string
    photos?: Photo[]
}

const PlacePhotos: React.FC<PlacePhotosProps> = ({ placeId, photos }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.placePhotos'
    })

    const dispatch = useAppDispatch()
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos || [])
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const inputFile = useRef<HTMLInputElement>(null)

    const [
        uploadPhoto,
        { data: uploadData, isLoading: uploadLoading, isError: uploadError }
    ] = API.usePhotoPostUploadMutation()

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
        () => selectedFiles.map((file) => URL.createObjectURL(file)).reverse(),
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

    React.useEffect(() => {
        setSelectedFiles([])
        setLocalPhotos(photos || [])
    }, [placeId])

    return (
        <Container
            title={t('title')}
            action={
                <Button
                    icon={'Camera'}
                    disabled={uploadLoading}
                    onClick={handlePhotoUploadClick}
                >
                    {t('buttonUpload')}
                </Button>
            }
        >
            <PhotoGallery
                photos={localPhotos}
                uploadingPhotos={uploadingPhotos}
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
