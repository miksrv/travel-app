import React from 'react'
import { TFunction } from 'i18next'
import Image from 'next/image'
import Link from 'next/link'

import styles from './styles.module.sass'

import { IMG_HOST } from '@/api/api'
import { Place } from '@/api/types/Place'
import { addressToString } from '@/functions/address'
import { categoryImage } from '@/functions/categories'
import { addDecimalPoint, dateToUnixTime, numberFormatter } from '@/functions/helpers'
import Badge from '@/ui/badge'

interface PlacesListItemProps {
    t: TFunction
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ t, place }) => (
    <article className={styles.placesListItem}>
        <div className={styles.photoSection}>
            <Image
                className={styles.categoryIcon}
                src={categoryImage(place.category?.name).src}
                alt={''}
                width={22}
                height={26}
            />

            <Link
                href={`/places/${place.id}`}
                title={place.title}
            >
                {place.cover && (
                    <Image
                        className={styles.photo}
                        alt={place.title || ''}
                        quality={70}
                        height={200}
                        width={280}
                        src={`${IMG_HOST}${place.cover.preview}?d=${dateToUnixTime(place.updated?.date)}`}
                    />
                )}
            </Link>

            <div className={styles.bottomPanel}>
                <div className={styles.iconsPanel}>
                    {!!place.rating && (
                        <Badge
                            icon={'Star'}
                            content={addDecimalPoint(place.rating)}
                        />
                    )}

                    {!!place.distance && (
                        <Badge
                            icon={'Ruler'}
                            content={numberFormatter(place.distance) + ' ' + t('km')}
                        />
                    )}
                </div>

                <h2 className={styles.title}>
                    <Link
                        href={`/places/${place.id}`}
                        title={place.title}
                    >
                        {place.title}
                    </Link>
                </h2>

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
            </div>
        </div>

        <p>
            {place.content?.length ? (
                place.content
            ) : (
                <span className={styles.emptyContent}>{t('description-not-added-yet')}</span>
            )}
        </p>
    </article>
)

export default PlacesListItem
