import { useTranslation } from 'next-i18next'
import React from 'react'

import { Place } from '@/api/types/Place'

import PlacesListItemFlatLoader from '@/components/places-list-flat/PlacesListItemFlatLoader'

import PlacesListItemFlat from './PlacesListItemFlat'
import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
    loading?: boolean
}

const TKEY = 'components.placesList.placesListItem.'

const PlacesListFlat: React.FC<PlacesListProps> = ({ places, loading }) => {
    const { t } = useTranslation()

    return (
        <>
            {loading &&
                Array(3)
                    .fill('')
                    .map((_, i) => <PlacesListItemFlatLoader key={i} />)}

            {places?.length ? (
                places?.map((place) => (
                    <PlacesListItemFlat
                        key={place.id}
                        place={place}
                    />
                ))
            ) : !loading ? (
                <div className={styles.emptyList}>{t(`${TKEY}noData`)}</div>
            ) : (
                <></>
            )}
        </>
    )
}
export default PlacesListFlat
