import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'
import Lightbox from 'react-image-lightbox'

import { IMG_HOST } from '@/api/api'
import { Photo, Poi } from '@/api/types'

import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'

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
    const { t } = useTranslation('common', {
        keyPrefix: 'components.photoLightbox'
    })

    const imageHost = (link?: string) =>
        link?.includes('http://') || link?.includes('https://')
            ? link
            : `${IMG_HOST}${link}`

    const imageUrl = (index: number) => imageHost(photos?.[index]?.full)
    const ImagePreviewUrl = (index: number) =>
        imageHost(photos?.[index]?.preview)

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
                    imageTitle={
                        photos[photoIndex]?.placeId ? (
                            <Link
                                href={`/places/${photos[photoIndex].placeId}`}
                                title={photos[photoIndex]?.title}
                            >
                                {photos[photoIndex]?.title}
                            </Link>
                        ) : (
                            photos[photoIndex]?.title
                        )
                    }
                    imageCaption={
                        photos[photoIndex]?.author && (
                            <UserAvatar
                                size={'medium'}
                                showName={true}
                                user={photos[photoIndex]?.author}
                                caption={formatDate(
                                    photos[photoIndex]?.created?.date,
                                    t('dateFormat')
                                )}
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
