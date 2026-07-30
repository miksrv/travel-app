import React from 'react'
import { cn } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'
import { Rating, UserAvatar } from '@/components/shared'
import { IMG_HOST } from '@/config/env'
import { formatDate, removeMarkdown, timeAgo } from '@/utils/helpers'

import styles from './styles.module.sass'

interface ActivityListItemProps {
    item: ApiModel.Activity
    compact?: boolean
    hidePlaceName?: boolean
    hideCover?: boolean
    /** Called with the clicked photo index; the lightbox itself is rendered once by the parent list. */
    onPhotoClick?: (photoIndex: number) => void
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({
    item,
    compact,
    hidePlaceName,
    hideCover,
    onPhotoClick
}) => {
    const { t, i18n } = useTranslation('components.activity-list')

    const actionText = {
        [ApiModel.ActivityTypes.Comment]: t('activity-comment', { defaultValue: 'оставил(-а) отзыв' }),
        [ApiModel.ActivityTypes.Cover]: t('activity-cover', { defaultValue: 'обновил(-а) обложку' }),
        [ApiModel.ActivityTypes.Edit]: t('activity-editing', { defaultValue: 'отредактировал(-а)' }),
        [ApiModel.ActivityTypes.Place]: t('activity-new-place', { defaultValue: 'добавил(-а)' }),
        [ApiModel.ActivityTypes.Photo]: t('activity-uploading-photo', { defaultValue: 'загрузил(-а) фото' }),
        [ApiModel.ActivityTypes.Rating]: t('activity-rating', { defaultValue: 'оценил(-а)' }),
        [ApiModel.ActivityTypes.Visit]: t('activity-visit', { defaultValue: 'посетил(-а)' })
    }[item.type]

    const coverPreview = item.place?.cover?.preview
    const isCoverRelevant =
        !hideCover || item.type === ApiModel.ActivityTypes.Cover || item.type === ApiModel.ActivityTypes.Photo
    const showCoverInGrid =
        isCoverRelevant && !item.photos?.length && item.type !== ApiModel.ActivityTypes.Photo && !!coverPreview

    const hasPhotos = !!item.photos?.length
    const extraCount = hasPhotos ? Math.max(0, item.photos!.length - 4) : 0
    const visiblePhotos = hasPhotos ? item.photos!.slice(0, 4) : []
    const showPhotos = hasPhotos || showCoverInGrid

    const header = (
        <div className={styles.header}>
            <UserAvatar
                className={styles.userAvatar}
                size={'medium'}
                user={item.author}
            />
            <div className={styles.nameAction}>
                {item.author?.id ? (
                    <Link
                        href={`/users/${item.author.id}`}
                        title={item.author.name}
                    >
                        {item.author.name}
                    </Link>
                ) : (
                    t('guest-user', { defaultValue: 'Гость' })
                )}
                {actionText && <span className={styles.actionText}>{actionText}</span>}
                {item.type === ApiModel.ActivityTypes.Edit && !!item.place?.difference && (
                    <span
                        className={cn(styles.diffBadge, item.place.difference > 0 ? styles.diffPos : styles.diffNeg)}
                        title={t('activity-diff-chars', { defaultValue: 'Изменено символов' })}
                    >
                        {item.place.difference > 0 ? `+${item.place.difference}` : item.place.difference}
                    </span>
                )}
            </div>
            {!hidePlaceName && (
                <Link
                    href={`/places/${item.place?.id}`}
                    title={item.place?.title}
                    className={styles.pointLink}
                >
                    {item.place?.title}
                </Link>
            )}
            <time
                className={styles.time}
                dateTime={item.created?.date}
                title={formatDate(item.created?.date, t('date_time_format', { defaultValue: 'D MMMM YYYY, HH:mm' }))}
            >
                {timeAgo(item.created?.date, false, i18n.language)}
            </time>
        </div>
    )

    const ratingBadge = item.type === ApiModel.ActivityTypes.Rating && !!item.rating?.value && (
        <Rating
            className={styles.ratingInline}
            value={item.rating.value}
            voted={true}
            disabled={true}
        />
    )

    const photos = showPhotos && (
        <div className={cn(styles.photos, compact && styles.compactPhotos)}>
            {hasPhotos ? (
                <>
                    {visiblePhotos.map((photo, i) => (
                        <button
                            key={i}
                            className={styles.photoThumbBtn}
                            onClick={() => onPhotoClick?.(i)}
                            aria-label={`${t('photo', { defaultValue: 'Фото' })} ${i + 1}`}
                        >
                            <img
                                src={`${IMG_HOST}${photo.preview}`}
                                alt={''}
                                className={styles.photoThumb}
                            />
                            {i === visiblePhotos.length - 1 && extraCount > 0 && (
                                <div className={styles.photoOverlay}>+{extraCount}</div>
                            )}
                        </button>
                    ))}
                </>
            ) : (
                coverPreview && (
                    <Link
                        href={`/places/${item.place?.id}`}
                        className={styles.photoThumbBtn}
                        title={item.place?.title}
                    >
                        <img
                            src={`${IMG_HOST}${coverPreview}`}
                            alt={item.place?.title ?? ''}
                            className={styles.photoThumb}
                            onError={(e) => {
                                e.currentTarget.parentElement?.setAttribute('style', 'display:none')
                            }}
                        />
                    </Link>
                )
            )}
        </div>
    )

    return (
        <div className={cn(styles.activityItem, compact && styles.compact)}>
            <div className={styles.left}>
                {header}
                {ratingBadge}

                {!compact && (
                    <>
                        {(item.type === ApiModel.ActivityTypes.Place || item.type === ApiModel.ActivityTypes.Edit) &&
                            item.place?.content && (
                                <p className={styles.content}>
                                    {removeMarkdown(item.place.content)}
                                    {item.place.content.length >= 500 ? '…' : ''}
                                </p>
                            )}

                        {item.type === ApiModel.ActivityTypes.Comment && item.comment?.content && (
                            <div className={'placeContent'}>
                                <blockquote>{item.comment.content}</blockquote>
                            </div>
                        )}
                    </>
                )}
            </div>

            {photos}
        </div>
    )
}
