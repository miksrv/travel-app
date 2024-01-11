import React from 'react'

import Container from '@/ui/container'

import { Place } from '@/api/types/Place'

import PlacesListItem from '@/components/places-list/PlacesListItem'

import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
}

const PlacesList: React.FC<PlacesListProps> = ({ places }) =>
    places?.length ? (
        <section className={styles.component}>
            {places?.map((place) => (
                <PlacesListItem
                    key={place.id}
                    place={place}
                />
            ))}
        </section>
    ) : (
        <Container className={styles.emptyList}>
            Нет интересных мест по вашему запросу. Попробуйте изменить условия
            поиска.
        </Container>
    )

export default PlacesList
