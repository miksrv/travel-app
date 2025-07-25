import React, { useState } from 'react'
import PhotoAlbum from 'react-photo-album'
import { cn, Container, Icon } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { ApiModel, IMG_HOST } from '@/api'
import PhotoLightbox from '@/components/photo-lightbox'
import UserAvatar from '@/components/user-avatar'
import { formatDate } from '@/functions/helpers'
import ReadMore from '@/ui/read-more'

import 'react-photo-album/rows.css'
import styles from './styles.module.sass'

interface ActivityListItemProps {
    item: ApiModel.Activity
    title?: string
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ item, title }) => {
    const { t } = useTranslation()

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handlePhotoClick = (index: number) => {
        setPhotoIndex(index)
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
                        {formatDate(item.created?.date, t('date-time-format'))}
                        {' • '}
                        {
                            {
                                [ApiModel.ActivityTypes.Edit]: t('editing'),
                                [ApiModel.ActivityTypes.Place]: t('new-geotag'),
                                [ApiModel.ActivityTypes.Photo]: t('uploading-photo'),
                                [ApiModel.ActivityTypes.Rating]: t('geotag-rating')
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

            {(item.type === ApiModel.ActivityTypes.Place || item.type === ApiModel.ActivityTypes.Edit) &&
                item.place?.content && (
                    <ReadMore
                        className={cn(styles.content, !!item.photos?.length && styles.contentGallery)}
                        showMoreText={t('show-more')}
                        showLessText={t('show-less')}
                    >
                        {item.place.content}
                    </ReadMore>
                )}

            {!!item.photos?.length && (
                <>
                    {/*todo: https://react-photo-album.com/examples/nextjs*/}
                    <PhotoAlbum
                        layout={'rows'}
                        spacing={5}
                        photos={item.photos.map((photo) => ({
                            height: photo.height,
                            src: `${IMG_HOST}${photo.preview}`,
                            width: photo.width
                        }))}
                        onClick={({ index }) => {
                            handlePhotoClick(index)
                        }}
                    />

                    <PhotoLightbox
                        photos={item.photos}
                        photoIndex={photoIndex}
                        showLightbox={showLightbox}
                        onCloseLightBox={handleCloseLightbox}
                    />
                </>
            )}

            <div className={styles.bottomBar}>
                <Link
                    href={`/places/${item.place?.id}`}
                    title={item.place?.title}
                    className={styles.pointLink}
                >
                    {item.place?.title}
                </Link>

                {!!item.views && (
                    <div className={styles.viewCounter}>
                        <Icon name={'Eye'} />
                        {item.views || 0}
                    </div>
                )}
            </div>
        </Container>
    )
}

export default ActivityListItem
