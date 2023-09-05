import { Place } from '@/api/types/Place'
import { PhotoCamera, Star } from '@mui/icons-material'
import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import noPhoto from '@/public/images/no-photo-available.png'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => {
    return (
        <div className={styles.placesListItem}>
            <div className={styles.header}>
                <Image
                    className={styles.categoryIcon}
                    src={`/poi/${
                        place?.subcategory?.name || place?.category?.name
                    }.png`}
                    alt={''}
                    width={26}
                    height={30}
                />
                <Link
                    className={styles.link}
                    href={`/places/${place?.id}`}
                    title={place?.title || ''}
                >
                    {place?.photos?.[0]?.filename ? (
                        <Image
                            className={styles.photo}
                            src={`http://localhost:8080/photos/${place?.id}/${place?.photos?.[0]?.filename}_thumb.${place?.photos?.[0]?.extension}`}
                            alt={place?.title || ''}
                            width={place?.photos?.[0]?.width}
                            height={place?.photos?.[0]?.height}
                        />
                    ) : (
                        <Image
                            className={styles.photo}
                            src={noPhoto.src}
                            alt={'No photo'}
                            width={noPhoto.width}
                            height={noPhoto.height}
                        />
                    )}
                </Link>
                <div className={styles.headerBottom}>
                    <div className={styles.element}>
                        <PhotoCamera className={styles.icon} />
                        {place.photosCount || 0}
                    </div>
                    {place.rating > 0 && (
                        <div className={styles.element}>
                            <Star
                                className={classNames(
                                    styles.icon,
                                    styles.rating
                                )}
                            />
                            {place.rating || 0}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{place?.title}</h3>
                <p className={styles.description}>{place?.content}...</p>
            </div>
        </div>
    )
}

export default PlacesListItem
