import { Place } from '@/api/types/Place'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => {
    const imageSource: string = `http://localhost:8080/photos/${place?.id}/${place?.photos?.[0]?.filename}_thumb.${place?.photos?.[0]?.extension}`

    return (
        <div className={styles.placesListItem}>
            <div className={styles.header}>
                <Link
                    className={styles.link}
                    href={`/places/${place?.id}`}
                    title={place?.title || ''}
                >
                    <Image
                        className={styles.photo}
                        src={imageSource}
                        alt={place?.title || ''}
                        width={place?.photos?.[0]?.width}
                        height={place?.photos?.[0]?.height}
                    />
                </Link>
                <div className={styles.photoCounter}>0</div>
                <div className={styles.rating}>0</div>
                <div className={styles.distance}>22km</div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{place?.title}</h3>
                <p className={styles.description}>{place?.content}</p>
            </div>
        </div>
    )
}

export default PlacesListItem
