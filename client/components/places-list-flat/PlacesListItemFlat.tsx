import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

import Icon from '@/ui/icon'

import { IMG_HOST } from '@/api/api'
import { Place } from '@/api/types/Place'

import { addressToString } from '@/functions/address'
import { categoryImage } from '@/functions/categories'
import {
    addDecimalPoint,
    dateToUnixTime,
    numberFormatter
} from '@/functions/helpers'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItemFlat: React.FC<PlacesListItemProps> = ({ place }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    const placeAddress = useMemo(
        () => addressToString(place.address),
        [place?.address]
    )

    return (
        <article className={styles.placeFlatItem}>
            <section className={styles.photoSection}>
                <Link
                    href={`/places/${place.id}`}
                    title={place.title}
                >
                    {place?.cover && (
                        <Image
                            className={styles.photo}
                            priority={true}
                            alt={place?.title || ''}
                            quality={50}
                            height={50}
                            width={100}
                            objectFit={'cover'}
                            src={`${IMG_HOST}${
                                place.cover.preview
                            }?d=${dateToUnixTime(place.updated?.date)}`}
                        />
                    )}
                </Link>
            </section>

            <section>
                <h2 className={styles.title}>
                    <Image
                        className={styles.categoryIcon}
                        src={categoryImage(place.category?.name).src}
                        alt={''}
                        width={16}
                        height={18}
                    />

                    <Link
                        href={`/places/${place.id}`}
                        title={place.title}
                    >
                        {place?.title}
                    </Link>
                </h2>

                <div className={styles.bottomPanel}>
                    <div className={styles.statistic}>
                        <div className={styles.icon}>
                            <Icon name={'Eye'} />
                            {numberFormatter(place?.views || 0)}
                        </div>

                        <div className={styles.icon}>
                            <Icon name={'Photo'} />
                            {place?.photos || 0}
                        </div>

                        {!!place?.comments && (
                            <div className={styles.icon}>
                                <Icon name={'Comment'} />
                                {place.comments}
                            </div>
                        )}

                        {!!place.rating && (
                            <div className={styles.icon}>
                                <Icon name={'Star'} />
                                {addDecimalPoint(place.rating)}
                            </div>
                        )}

                        {!!place?.distance && (
                            <div className={styles.icon}>
                                <Icon name={'Ruler'} />
                                {numberFormatter(place?.distance || 0)}
                            </div>
                        )}
                    </div>

                    <div className={styles.address}>
                        {placeAddress?.map((address, i) => (
                            <span key={`address${address.type}${place.id}`}>
                                <Link
                                    href={`/places?${address.type}=${address.id}`}
                                    title={`${t('addressLinkTitle')} ${
                                        address.name
                                    }`}
                                >
                                    {address.name}
                                </Link>
                                {placeAddress.length - 1 !== i && ', '}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </article>
    )
}

export default PlacesListItemFlat
