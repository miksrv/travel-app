import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Badge from '@/ui/badge'

import { ImageHost } from '@/api/api'
import { Place } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'
import { numberFormatter } from '@/functions/helpers'

import noPhoto from '@/public/images/no-photo-available.png'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => (
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
                    alt={place?.photo?.title || ''}
                    height={180}
                    width={260}
                    src={
                        place?.photo?.filename
                            ? `${ImageHost}photo/${place?.id}/${place?.photo?.filename}_thumb.${place?.photo?.extension}`
                            : noPhoto.src
                    }
                />
            </Link>
            <div className={styles.bottomPanel}>
                <Badge
                    icon={'Camera'}
                    content={place?.photoCount || 0}
                />
                <Badge
                    icon={'Star'}
                    content={place.rating}
                />
                <Badge
                    icon={'Eye'}
                    content={numberFormatter(place?.views || 0)}
                />
                <Badge
                    icon={'Ruler'}
                    content={numberFormatter(place?.distance || 0)}
                />
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
        <p>{place?.content || 'Нет данных для отображения'}</p>
    </article>
)

export default PlacesListItem
