import React from 'react'
import { Container, ContainerProps } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'

import { ActivityListItem } from './ActivityListItem'
import { ActivityListItemLoader } from './ActivityListItemLoader'

import styles from './styles.module.sass'

interface ActivityListProps extends Pick<ContainerProps, 'action' | 'footer'> {
    activities?: ApiModel.Activity[]
    title?: string
    loading?: boolean
    compact?: boolean
    scrollable?: boolean
    hidePlaceName?: boolean
    hideCover?: boolean
}

export const ActivityList: React.FC<ActivityListProps> = ({
    activities,
    loading,
    title,
    action,
    footer,
    compact,
    scrollable,
    hidePlaceName,
    hideCover
}) => {
    const { t } = useTranslation('components.activity-list')

    if (!activities?.length && !loading) {
        return (
            <Container className={'emptyList'}>
                {t('nothing-here-yet', { defaultValue: 'Тут пока ничего нет' })}
            </Container>
        )
    }

    const content = (
        <>
            {activities?.map((item, index) => (
                <ActivityListItem
                    key={`activity-${index}`}
                    item={item}
                    compact={compact}
                    hidePlaceName={hidePlaceName}
                    hideCover={hideCover}
                />
            ))}
            {loading && <ActivityListItemLoader />}
        </>
    )

    return (
        <Container
            title={title}
            action={action}
            footer={footer}
        >
            {scrollable ? <div className={styles.scrollableContent}>{content}</div> : content}
        </Container>
    )
}
