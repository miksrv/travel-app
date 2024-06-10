import { useTranslation } from 'next-i18next'
import React from 'react'

import Container from '@/ui/container'

import { Item } from '@/api/types/Activity'

import ActivityListItem from './ActivityListItem'
import ActivityListItemLoader from './ActivityListItemLoader'
import styles from './styles.module.sass'

interface PlacesListProps {
    activities?: Item[]
    title?: string
    loading?: boolean
}

const ActivityList: React.FC<PlacesListProps> = ({
    activities,
    loading,
    title
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.activityList'
    })

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
                <Container className={styles.emptyList}>
                    {t('emptyList')}
                </Container>
            )}

            {loading && <ActivityListItemLoader />}
        </>
    )
}

export default ActivityList
