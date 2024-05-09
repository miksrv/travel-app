import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useState } from 'react'
import Gallery from 'react-photo-gallery'

import Container from '@/ui/container'
import ReadMore from '@/ui/read-more'

import { IMG_HOST } from '@/api/api'
import { ActivityTypes, Item } from '@/api/types/Activity'

import PhotoLightbox from '@/components/photo-lightbox'
import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn, formatDate } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ActivityListItemProps {
    item: Item
    title?: string
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ item, title }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.activityList'
    })

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handlePhotoClick = (event: React.MouseEvent, photos: any) => {
        setPhotoIndex(photos.index)
        setShowLightbox(true)
    }

    return (
        <Container
            title={title}
            className={styles.activityContainer}
        >
            <UserAvatar
                className={styles.userAvatar}
                size={'medium'}
                user={item.author}
                showName={true}
                caption={
                    <>
                        {formatDate(item.created?.date, t('dateFormat'))}
                        {' • '}
                        {
                            {
                                [ActivityTypes.Edit]: t('edit'),
                                [ActivityTypes.Place]: t('place'),
                                [ActivityTypes.Photo]: t('photo'),
                                [ActivityTypes.Rating]: t('rating')
                            }[item.type]
                        }
                        {/*{item.type === ActivityTypes.Edit &&*/}
                        {/*item.place?.difference ? (*/}
                        {/*    <>*/}
                        {/*        {' ('}*/}
                        {/*        <span*/}
                        {/*            className={*/}
                        {/*                item.place.difference > 0*/}
                        {/*                    ? 'green'*/}
                        {/*                    : 'red'*/}
                        {/*            }*/}
                        {/*        >*/}
                        {/*            {item.place.difference > 0 && '+'}*/}
                        {/*            {item.place.difference}*/}
                        {/*        </span>*/}
                        {/*        {')'}*/}
                        {/*    </>*/}
                        {/*) : (*/}
                        {/*    ''*/}
                        {/*)}*/}
                    </>
                }
            />

            {(item.type === ActivityTypes.Place ||
                item.type === ActivityTypes.Edit) &&
                item.place?.content && (
                    <ReadMore
                        className={cn(
                            styles.content,
                            !!item.photos?.length && styles.contentGallery
                        )}
                        showMoreText={t('readMore')}
                        showLessText={t('readLess')}
                    >
                        {item.place?.content}
                    </ReadMore>
                )}

            {!!item.photos?.length && (
                <>
                    <Gallery
                        photos={item.photos?.map((photo) => ({
                            height: photo.height,
                            src: `${IMG_HOST}${photo.preview}`,
                            width: photo.width
                        }))}
                        onClick={handlePhotoClick}
                    />

                    <PhotoLightbox
                        photos={item.photos}
                        photoIndex={photoIndex}
                        showLightbox={showLightbox}
                        onChangeIndex={setPhotoIndex}
                        onCloseLightBox={handleCloseLightbox}
                    />
                </>
            )}

            <Link
                href={`/places/${item.place?.id}`}
                title={item.place?.title}
                className={styles.pointLink}
            >
                {item.place?.title}
            </Link>
        </Container>
    )
}

export default ActivityListItem
