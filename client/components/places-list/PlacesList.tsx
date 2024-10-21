import React from 'react'
import { useTranslation } from 'next-i18next'
import { Container } from 'simple-react-ui-kit'

import PlacesListItem from './PlacesListItem'
import styles from './styles.module.sass'

import { Place } from '@/api/types/Place'
import PlacesListItemLoader from '@/components/places-list/PlacesListItemLoader'

interface PlacesListProps {
    places?: Place[]
    loading?: boolean
}

const PlacesList: React.FC<PlacesListProps> = ({ places, loading }) => {
    const { t } = useTranslation()

    return (
        <>
            {!!places?.length && (
                <section className={styles.component}>
                    {places.map((place) => (
                        <PlacesListItem
                            t={t}
                            key={place.id}
                            place={place}
                        />
                    ))}
                </section>
            )}

            {loading && (
                <section className={styles.component}>
                    {Array(3)
                        .fill('')
                        .map((_, i) => (
                            <PlacesListItemLoader key={i} />
                        ))}
                </section>
            )}

            {!places?.length && !loading && (
                <Container
                    style={{ marginTop: 15 }}
                    className={'emptyList'}
                >
                    {t('nothing-here-yet')}
                </Container>
            )}
        </>
    )
}
export default PlacesList
