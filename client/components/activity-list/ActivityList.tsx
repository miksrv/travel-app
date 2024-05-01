import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import Gallery from 'react-photo-gallery'

import Container from '@/ui/container'
import Skeleton from '@/ui/skeleton'

import { IMG_HOST } from '@/api/api'
import { ActivityTypes, Item } from '@/api/types/Activity'

import PhotoLightbox from '@/components/photo-lightbox'
import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn } from '@/functions/helpers'
import { formatDate } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PlacesListProps {
    activities?: Item[]
    loading?: boolean
}

const ActivityList: React.FC<PlacesListProps> = ({ activities, loading }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.activityList'
    })

    return (
        <>
            {activities?.map((item, index) => (
                <ActivityListItem
                    key={`activity-${index}`}
                    item={item}
                />
            ))}

            {!activities?.length && !loading && (
                <Container className={styles.emptyList}>
                    {t('emptyList')}
                </Container>
            )}

            {loading && (
                <Container className={styles.activityContainer}>
                    <div
                        className={styles.userAvatar}
                        style={{ display: 'flex' }}
                    >
                        <Skeleton
                            style={{
                                borderRadius: '50%',
                                height: '32px',
                                width: '32px'
                            }}
                        />
                        <div style={{ marginLeft: '10px' }}>
                            <Skeleton
                                style={{
                                    height: '16px',
                                    marginBottom: '5px',
                                    width: '100px'
                                }}
                            />
                            <Skeleton
                                style={{
                                    height: '12px',
                                    width: '200px'
                                }}
                            />
                        </div>
                    </div>
                    {Array(5)
                        .fill('')
                        .map((_, i) => (
                            <Skeleton
                                key={i}
                                style={{
                                    height: '16px',
                                    marginBottom: '5px',
                                    width: i === 4 ? '75%' : '100%'
                                }}
                            />
                        ))}
                </Container>
            )}
        </>
    )
}

interface ActivityListItemProps {
    item: Item
}

const ActivityListItem: React.FC<ActivityListItemProps> = ({ item }) => {
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
        <Container className={styles.activityContainer}>
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
                    <Markdown
                        className={cn(
                            styles.content,
                            !!item.photos?.length && styles.contentGallery
                        )}
                    >
                        {item.place?.content}
                    </Markdown>
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

export default ActivityList
