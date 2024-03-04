import { useTranslation } from 'next-i18next'
import React from 'react'

import Container, { ContainerProps } from '@/ui/container'

import { Place } from '@/api/types/Place'

import PlacesListItemFlat from './PlacesListItemFlat'
import styles from './styles.module.sass'

interface PlacesListProps
    extends Pick<ContainerProps, 'title' | 'action' | 'footer'> {
    places?: Place[]
}

const PlacesListFlat: React.FC<PlacesListProps> = ({ places, ...props }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    return (
        <Container {...props}>
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
        </Container>
    )
}
export default PlacesListFlat
