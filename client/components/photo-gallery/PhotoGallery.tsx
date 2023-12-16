import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import React from 'react'

// import Gallery from 'react-photo-gallery'
import { ImageHost } from '@/api/api'
import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface PhotoGalleryProps {
    photos?: Photo[]
    onPhotoClick?: (index: number) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    onPhotoClick
}) => (
    <>
        {!!photos?.length && (
            <ImageList
                variant={'quilted'}
                cols={4}
                rowHeight={130}
                sx={{ m: 0 }}
            >
                {photos.map((photo, index) => (
                    <ImageListItem
                        key={photo.filename}
                        cols={1}
                        rows={1}
                    >
                        <img
                            className={styles.photo}
                            loading={'lazy'}
                            src={`${ImageHost}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`}
                            alt={photo.title || ''}
                            onClick={() => {
                                onPhotoClick?.(index)
                            }}
                        />

                        {/*<Image*/}
                        {/*    width={photo.width}*/}
                        {/*    height={photo.height}*/}
                        {/*    src={`${ImageHost}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`}*/}
                        {/*    alt={photo.title || ''}*/}
                        {/*    loading={'lazy'}*/}
                        {/*/>*/}
                    </ImageListItem>
                ))}
            </ImageList>
        )}

        {/*<Gallery*/}
        {/*    photos={data.items.map((photo) => ({*/}
        {/*        height: photo.height,*/}
        {/*        src: `${ImageHost}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`,*/}
        {/*        width: photo.width*/}
        {/*    }))}*/}
        {/*    onClick={(event, photos) => {*/}
        {/*        setCurrentIndex(photos.index)*/}
        {/*        setShowLightbox(true)*/}
        {/*    }}*/}
        {/*/>*/}
    </>
)

export default PhotoGallery
