import { Place } from '@/api/types/Place'
import React from 'react'

import PlacesListItem from '@/components/places-list-item'

import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
}

const PlacesList: React.FC<PlacesListProps> = ({ places }) => {
    return (
        <div className={styles.placesList}>
            {places?.map((place) => (
                <PlacesListItem
                    place={place}
                    key={place.id}
                />
            ))}
        </div>
    )
}

export default PlacesList
