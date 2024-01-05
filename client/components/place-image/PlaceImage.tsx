import Image from 'next/image'
import React from 'react'

import Badge from '@/ui/badge'

import { ImageHost } from '@/api/api'
import { Place } from '@/api/types/Place'

import { numberFormatter } from '@/functions/helpers'

import noPhoto from '@/public/images/no-photo-available.png'

import styles from './styles.module.sass'

interface PlacesListProps {
    place?: Place
}

const PlaceImage: React.FC<PlacesListProps> = ({ place }) => (
    <section className={styles.component}>
        <div className={styles.topPanel}>rating</div>
        <Image
            className={styles.image}
            alt={place?.photo?.title || ''}
            height={300}
            width={1100}
            src={
                place?.photo?.filename
                    ? `${ImageHost}photo/${place?.id}/${place?.photo?.filename}.${place?.photo?.extension}`
                    : noPhoto.src
            }
        />
        <div className={styles.bottomPanel}>
            <Badge
                icon={'Eye'}
                content={numberFormatter(place?.views || 0)}
            />
            <Badge
                icon={'Camera'}
                content={place?.photoCount || 0}
            />
            <Badge
                icon={'Camera'}
                content={numberFormatter(place?.distance || 0)}
            />
        </div>
    </section>
)

export default PlaceImage
