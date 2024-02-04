import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Badge from '@/ui/badge'

import { IMG_HOST } from '@/api/api'
import { Place } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'
import { numberFormatter } from '@/functions/helpers'

import noPhoto from '@/public/images/no-photo-available.png'

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
                <Link
                    href={`/places/${place.id}`}
                    title={place.title}
                >
                    <Image
                        className={styles.photo}
                        priority={true}
                        alt={place?.photo?.title || ''}
                        height={180}
                        width={280}
                        src={
                            place?.photo?.filename
                                ? `${IMG_HOST}photo/${place?.id}/${place?.photo?.filename}_thumb.${place?.photo?.extension}`
                                : noPhoto.src
                        }
                    />
                </Link>
                <div className={styles.bottomPanel}>
                    <Badge
                        icon={'Photo'}
                        content={place?.photoCount || 0}
                    />
                    {!!place.rating && (
                        <Badge
                            icon={'Star'}
                            content={place.rating}
                        />
                    )}
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
