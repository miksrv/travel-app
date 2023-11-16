import { Button } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import React, { useRef, useState } from 'react'

import { API } from '@/api/api'
import { Photo } from '@/api/types/Photo'

import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

interface PlaceTabPhotosProps {
    title?: string
    placeId?: string
    photos?: Photo[]
}

const PlaceTabPhotos: React.FC<PlaceTabPhotosProps> = ({
    title,
    placeId,
    photos
}) => {
    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()
    const inputFile = useRef<HTMLInputElement>(null)

    const [
        uploadPhoto,
        { data: uploadData, isLoading: uploadLoading, isSuccess: uploadSuccess }
    ] = API.usePhotoPostUploadMutation()

    const handlePhotoClick = (index: number) => {
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handleSelectedFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!event.target.files?.length) {
            return
        }

        const formData = new FormData()

        Array.from(event.target.files).forEach((photo, index) => {
            formData.append(`photo${index}`, photo)
        })

        uploadPhoto({
            formData,
            place: placeId
        })
    }

    return (
        <>
            <CardHeader
                title={title ? `${title} - фотографии` : 'Фотографии'}
                titleTypographyProps={{
                    component: 'h2',
                    fontSize: 18
                }}
                sx={{ mb: -2 }}
                action={
                    <Button
                        sx={{ mr: 0 }}
                        size={'medium'}
                        variant={'contained'}
                        disabled={uploadLoading}
                        onClick={() => inputFile.current?.click()}
                    >
                        {'Загрузить'}
                    </Button>
                }
            />
            <input
                multiple={true}
                ref={inputFile}
                style={{ display: 'none' }}
                type={'file'}
                accept={'image/png, image/gif, image/jpeg'}
                onChange={handleSelectedFilesUpload}
            />
            <CardContent sx={{ mb: -1 }}>
                <PhotoGallery
                    photos={photos}
                    onPhotoClick={handlePhotoClick}
                />
                <PhotoLightbox
                    photos={photos}
                    photoIndex={photoIndex}
                    showLightbox={showLightbox}
                    onChangeIndex={setPhotoIndex}
                    onCloseLightBox={handleCloseLightbox}
                />
            </CardContent>
        </>
    )
}

export default PlaceTabPhotos
