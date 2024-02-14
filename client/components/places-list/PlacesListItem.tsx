import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Badge from '@/ui/badge'
import RatingColored from '@/ui/rating-colored'

import { IMG_HOST } from '@/api/api'
import { Place } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'
import { addDecimalPoint, numberFormatter } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    return (
        <article className={styles.placesListItem}>
            <section className={styles.photoSection}>
                <Image
                    className={styles.categoryIcon}
                    src={categoryImage(place.category?.name).src}
                    alt={''}
                    width={22}
                    height={26}
                />

                {!!place.rating && (
                    <RatingColored
                        className={styles.rating}
                        value={place.rating}
                    >
                        {addDecimalPoint(place.rating)}
                    </RatingColored>
                )}

                <Link
                    href={`/places/${place.id}`}
                    title={place.title}
                >
                    {place?.cover && (
                        <Image
                            className={styles.photo}
                            priority={true}
                            alt={place?.title || ''}
                            height={180}
                            width={280}
                            src={`${IMG_HOST}${place.cover.preview}`}
                        />
                    )}
                </Link>
                <div className={styles.bottomPanel}>
                    <Badge
                        icon={'Photo'}
                        content={place?.photos || 0}
                    />
                    <Badge
                        icon={'Eye'}
                        content={numberFormatter(place?.views || 0)}
                    />
                    {!!place?.distance && (
                        <Badge
                            icon={'Ruler'}
                            content={numberFormatter(place?.distance || 0)}
                        />
                    )}
                </div>
            </section>
            <h2 className={styles.title}>
                <Link
                    href={`/places/${place.id}`}
                    title={place.title}
                >
                    {place?.title}
                </Link>
            </h2>
            {place?.content ? (
                <p>{place.content}</p>
            ) : (
                <div className={styles.emptyContent}>{t('noData')}</div>
            )}
        </article>
    )
}

export default PlacesListItem
