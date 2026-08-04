import React from 'react'
import { Icon } from 'simple-react-ui-kit'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'
import { UserAvatar } from '@/components/shared/user-avatar'
import { IMG_HOST } from '@/config/env'
import { addressToString } from '@/utils/address'
import { categoryImage } from '@/utils/categories'
import { addDecimalPoint, dateToUnixTime, numberFormatter, timeAgo } from '@/utils/helpers'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: ApiModel.Place
}

export const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => {
    const { t, i18n } = useTranslation()

    return (
        <article className={styles.placesListItem}>
            <Link
                href={`/places/${place.id}`}
                title={place.title}
                className={styles.photoLink}
            >
                {place.cover && (
                    <Image
                        className={styles.photo}
                        alt={place.title || ''}
                        quality={75}
                        fill
                        sizes={'(max-width: 768px) 100vw, 33vw'}
                        src={`${IMG_HOST}${place.cover.preview}?d=${dateToUnixTime(place.updated?.date)}`}
                    />
                )}
            </Link>

            <div className={styles.topOverlay}>
                <UserAvatar
                    user={place.author}
                    size={'tiny'}
                    showName={true}
                    hideOnlineIcon={true}
                    caption={timeAgo(place.updated?.date, undefined, i18n.language)}
                    className={styles.authorOverlay}
                />
            </div>

            {place.category && (
                <Image
                    src={categoryImage(place.category.name).src}
                    alt={place.category.title}
                    title={place.category.title}
                    width={16}
                    height={16}
                    className={styles.categoryOverlay}
                />
            )}

            <div className={styles.bottomOverlay}>
                <h2 className={styles.title}>
                    <Link
                        href={`/places/${place.id}`}
                        title={place.title}
                    >
                        {place.title}
                    </Link>
                </h2>

                {!!addressToString(place.address)?.length && (
                    <div className={styles.address}>
                        {addressToString(place.address)?.map((address, i, array) => (
                            <span key={`address${address.type}${place.id}`}>
                                <Link
                                    href={`/places?${address.type}=${address.id}`}
                                    title={`${t('all-geotags-at-address')} ${address.name}`}
                                >
                                    {address.name}
                                </Link>
                                {array.length - 1 !== i && ', '}
                            </span>
                        ))}
                    </div>
                )}

                <div className={styles.statsRow}>
                    {!!place.rating && (
                        <span className={styles.stat}>
                            <Icon name={'StarEmpty'} />
                            {addDecimalPoint(place.rating)}
                        </span>
                    )}

                    {!!place.distance && (
                        <span className={styles.stat}>
                            <Icon name={'Ruler'} />
                            {numberFormatter(place.distance)}&nbsp;{t('km')}
                        </span>
                    )}

                    {!!place.views && (
                        <span className={styles.stat}>
                            <Icon name={'Eye'} />
                            {numberFormatter(place.views)}
                        </span>
                    )}

                    {!!place.photos && (
                        <span className={styles.stat}>
                            <Icon name={'Camera'} />
                            {place.photos}
                        </span>
                    )}
                </div>
            </div>
        </article>
    )
}
