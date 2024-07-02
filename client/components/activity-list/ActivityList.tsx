import React from 'react'
import { useTranslation } from 'next-i18next'

import ActivityListItem from './ActivityListItem'
import ActivityListItemLoader from './ActivityListItemLoader'
import styles from './styles.module.sass'

import { Item } from '@/api/types/Activity'
import Container from '@/ui/container'

interface PlacesListProps {
    activities?: Item[]
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
                <Container className={styles.emptyList}>{t('nothing-here-yet')}</Container>
            )}

            {loading && <ActivityListItemLoader />}
        </>
    )
}

export default ActivityList
