import { useTranslation } from 'next-i18next'
import React from 'react'

import { Place } from '@/api/types/Place'

import PlacesListItemFlat from './PlacesListItemFlat'
import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
}

const PlacesListFlat: React.FC<PlacesListProps> = ({ places }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    return (
        <>
            {places?.length ? (
                places?.map((place) => (
                    <PlacesListItemFlat
                        key={place.id}
                        place={place}
                    />
                ))
            ) : (
                <div className={styles.emptyList}>{t('noData')}</div>
            )}
        </>
    )
}
export default PlacesListFlat
