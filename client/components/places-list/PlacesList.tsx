import { useTranslation } from 'next-i18next'
import React from 'react'

import Container from '@/ui/container'

import { Place } from '@/api/types/Place'

import PlacesListItem from './PlacesListItem'
import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
}

const PlacesList: React.FC<PlacesListProps> = ({ places }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList'
    })

    return places?.length ? (
        <section className={styles.component}>
            {places?.map((place) => (
                <PlacesListItem
                    key={place.id}
                    place={place}
                />
            ))}
        </section>
    ) : (
        <Container className={styles.emptyList}>{t('emptyList')}</Container>
    )
}
export default PlacesList
