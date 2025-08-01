import React, { LegacyRef, RefObject, useEffect, useState } from 'react'

import { API, ApiModel, useAppDispatch } from '@/api'
import { Notify } from '@/api/notificationSlice'

interface PhotoUploaderProps {
    placeId?: string
    onSelectFiles?: (uploadingPhotosData?: string[]) => void
    onUploadPhoto?: (photo: ApiModel.Photo) => void
    fileInputRef?: RefObject<HTMLInputElement | null>
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ placeId, onSelectFiles, onUploadPhoto, fileInputRef }) => {
    const dispatch = useAppDispatch()
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const [
        handleUploadPhoto,
        { data: uploadedPhoto, isLoading: uploadLoading, isError: uploadError, error: uploadErrorText }
    ] = API.usePhotoPostUploadMutation()

    const handleSelectedFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files

        if (files?.length && placeId && !uploadLoading) {
            const filesList = Array.from(files).map((file) => file)
            setSelectedFiles(filesList)
        }
    }

    /**
     * If an error occurs in downloading a file, clear the queue of the list of photos for downloading
     * #TODO:Add notification
     */
    useEffect(() => {
        if (selectedFiles && uploadError) {
            setSelectedFiles([])

            void dispatch(
                Notify({
                    id: 'uploadPhotoError',
                    title: '',
                    message: uploadErrorText as string,
                    type: 'error'
                })
            )
        }
    }, [uploadError])

    /** After successfully uploading each photo:
     * - remove one file from the download queue
     * - add the uploaded photo to the list of other photos
     */
    useEffect(() => {
        if (uploadedPhoto) {
            const uploadingFiles = [...selectedFiles]
            uploadingFiles.shift()

            setSelectedFiles(uploadingFiles)
            onUploadPhoto?.(uploadedPhoto)
        }
    }, [uploadedPhoto])

    /**
     * After each update of the download queue:
     * - perform a request to download the first file from the queue
     */
    useEffect(() => {
        if (selectedFiles.length) {
            const formData = new FormData()

            formData.append('photo', selectedFiles[0])

            void handleUploadPhoto({
                count: selectedFiles.length,
                formData,
                place: placeId
            })
        }
    }, [selectedFiles])

    useEffect(() => {
        setSelectedFiles([])
    }, [placeId])

    useEffect(() => {
        onSelectFiles?.(selectedFiles?.map((file) => URL.createObjectURL(file)).reverse())
    }, [selectedFiles])

    return (
        <input
            multiple={true}
            ref={fileInputRef as LegacyRef<HTMLInputElement> | undefined}
            style={{ display: 'none' }}
            type={'file'}
            accept={'image/png, image/gif, image/jpeg'}
            onChange={handleSelectedFilesUpload}
        />
    )
}

export default PhotoUploader
