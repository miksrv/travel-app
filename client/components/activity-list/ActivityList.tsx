import React from 'react'
import { Container } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next'

import { ApiModel } from '@/api'

import ActivityListItem from './ActivityListItem'
import ActivityListItemLoader from './ActivityListItemLoader'

interface PlacesListProps {
    activities?: ApiModel.Activity[]
    title?: string
    loading?: boolean
}

const ActivityList: React.FC<PlacesListProps> = ({ activities, loading, title }) => {
    const { t } = useTranslation()

    return (
        <>
            {activities?.map((item, index) => (
                <ActivityListItem
                    key={`activity-${index}`}
                    item={item}
                    title={title && index === 0 ? title : undefined}
                />
            ))}

            {!activities?.length && !loading && (
                <Container
                    style={{ marginTop: 15 }}
                    className={'emptyList'}
                >
                    {t('nothing-here-yet')}
                </Container>
            )}

            {loading && <ActivityListItemLoader />}
        </>
    )
}

export default ActivityList
