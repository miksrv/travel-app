import React from 'react'
import Lightbox from 'react-image-lightbox'

import { IMG_HOST } from '@/api/api'
import { Photo, Poi } from '@/api/types'

import UserAvatar from '@/components/user-avatar'

// import { formatDate } from '@/functions/helpers'

interface PhotoLightboxProps {
    photos?: Photo.Photo[] | Poi.Photo[]
    photoIndex?: number
    showLightbox?: boolean
    onCloseLightBox?: () => void
    onChangeIndex?: (index: number) => void
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
    photos,
    photoIndex = 0,
    showLightbox,
    onCloseLightBox,
    onChangeIndex
}) => {
    const imageUrl = (index: number) => `${IMG_HOST}${photos?.[index]?.full}`
    const ImagePreviewUrl = (index: number) =>
        `${IMG_HOST}${photos?.[index]?.preview}`

    return (
        <>
            {showLightbox && !!photos?.length && (
                <Lightbox
                    mainSrc={imageUrl(photoIndex)}
                    nextSrc={imageUrl((photoIndex + 1) % (photos.length || 0))}
                    prevSrc={imageUrl(
                        (photoIndex + (photos.length || 0) - 1) %
                            (photos.length || 0)
                    )}
                    mainSrcThumbnail={ImagePreviewUrl(photoIndex)}
                    prevSrcThumbnail={ImagePreviewUrl(
                        (photoIndex + (photos.length || 0) - 1) %
                            (photos.length || 0)
                    )}
                    nextSrcThumbnail={ImagePreviewUrl(
                        (photoIndex + 1) % (photos.length || 0)
                    )}
                    imageTitle={photos[photoIndex]?.title || ''}
                    imageCaption={
                        photos[photoIndex]?.author && (
                            <UserAvatar
                                size={'medium'}
                                user={photos[photoIndex]?.author}
                                // text={formatDate(
                                //     photos[photoIndex]?.created?.date
                                // )}
                            />
                        )
                    }
                    onCloseRequest={() => onCloseLightBox?.()}
                    onMovePrevRequest={() =>
                        onChangeIndex?.(
                            (photoIndex + (photos.length || 0) - 1) %
                                (photos.length || 0)
                        )
                    }
                    onMoveNextRequest={() =>
                        onChangeIndex?.((photoIndex + 1) % (photos.length || 0))
                    }
                />
            )}
        </>
    )
}

export default PhotoLightbox
