import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'
import Lightbox, { Slide } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

import { IMG_HOST } from '@/api/api'
import { Photo, Placemark } from '@/api/types'

import ImageSlide from '@/components/photo-lightbox/ImageSlide'
import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PhotoLightboxProps {
    photos?: Photo.Photo[] | Placemark.Photo[]
    photoIndex?: number
    showLightbox?: boolean
    onCloseLightBox?: () => void
    onChangeIndex?: (index: number) => void
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
    photos,
    photoIndex = 0,
    showLightbox,
    onCloseLightBox
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.photoLightbox'
    })

    const imageHost = (link?: string) =>
        link?.includes('http://') || link?.includes('https://')
            ? link
            : `${IMG_HOST}${link}`

    return (
        <Lightbox
            open={!!showLightbox}
            index={photoIndex}
            plugins={[Captions, Zoom]}
            close={onCloseLightBox}
            render={{ slide: ImageSlide }}
            slides={photos?.map(
                (photo: Photo.Photo & Placemark.Photo) =>
                    ({
                        alt: photo.title,
                        description: photo?.author && (
                            <UserAvatar
                                size={'medium'}
                                showName={true}
                                user={photo?.author}
                                className={styles.caption}
                                caption={formatDate(
                                    photo?.created?.date,
                                    t('dateFormat')
                                )}
                            />
                        ),
                        height: photo.height,
                        src: imageHost(photo.full),
                        title: photo?.placeId ? (
                            <Link
                                href={`/places/${photo.placeId}`}
                                title={photo?.title}
                                className={styles.title}
                            >
                                {photo?.title}
                            </Link>
                        ) : (
                            photo.title
                        ),
                        width: photo.width
                    } as Slide)
            )}
        />
    )
}

export default PhotoLightbox
