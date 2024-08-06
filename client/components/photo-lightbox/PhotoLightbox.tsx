import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import Lightbox, { Slide } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/styles.css'

import styles from './styles.module.sass'

import { IMG_HOST } from '@/api/api'
import { Photo, Placemark } from '@/api/types'
import ImageSlide from '@/components/photo-lightbox/ImageSlide'
import UserAvatar from '@/components/user-avatar'
import { formatDate } from '@/functions/helpers'

interface PhotoLightboxProps {
    photos?: Photo.Photo[] | Placemark.Photo[]
    photoIndex?: number
    showLightbox?: boolean
    onCloseLightBox?: () => void
    onChangeIndex?: (index: number) => void
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photos, photoIndex = 0, showLightbox, onCloseLightBox }) => {
    const { t } = useTranslation()

    const imageHost = (link?: string) =>
        link?.includes('http://') || link?.includes('https://') ? link : `${IMG_HOST}${link}`

    return (
        <Lightbox
            open={!!showLightbox}
            index={photoIndex}
            plugins={[Captions, Zoom]}
            close={onCloseLightBox}
            render={{ slide: ImageSlide as any }}
            slides={photos?.map(
                (photo) =>
                    ({
                        alt: photo.title,
                        description: photo.author && (
                            <UserAvatar
                                size={'medium'}
                                showName={true}
                                user={photo.author}
                                className={styles.caption}
                                caption={formatDate(photo.created?.date, t('date-time-format'))}
                            />
                        ),
                        height: (photo as Photo.Photo).height,
                        src: imageHost(photo.full),
                        // srcSet: [{ src: imageHost(photo.preview), width: 300, height: 200 }],
                        title: photo.placeId ? (
                            <Link
                                href={`/places/${photo.placeId}`}
                                title={photo.title}
                                className={styles.title}
                            >
                                {photo.title}
                            </Link>
                        ) : (
                            photo.title
                        ),
                        width: (photo as Photo.Photo).width
                    }) as Slide
            )}
        />
    )
}

export default PhotoLightbox
