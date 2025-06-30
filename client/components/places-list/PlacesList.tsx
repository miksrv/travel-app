import React from 'react'
import { Container } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next'

import { ApiModel } from '@/api'
import PlacesListItemLoader from '@/components/places-list/PlacesListItemLoader'

import PlacesListItem from './PlacesListItem'

import styles from './styles.module.sass'

interface PlacesListProps {
    places?: ApiModel.Place[]
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
