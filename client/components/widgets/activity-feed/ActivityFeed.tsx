import React from 'react'
import { Button } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'

import { ActivityList } from '../activity-list'

interface ActivityFeedProps {
    title?: string
    activities?: ApiModel.Activity[]
    loading?: boolean
    compact?: boolean
    scrollable?: boolean
    hidePlaceName?: boolean
    hideCover?: boolean
    actionHref?: string
    actionLabel?: string
    /** HTML `title` attribute for the action link, when it should differ from the visible label. */
    actionTitle?: string
    /** Called when the "show more" footer button is clicked. Renders the button only when provided. */
    onShowMore?: () => void
    hasMore?: boolean
    loadingMore?: boolean
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
    title,
    activities,
    loading,
    compact,
    scrollable,
    hidePlaceName,
    hideCover,
    actionHref,
    actionLabel,
    actionTitle,
    onShowMore,
    hasMore,
    loadingMore
}) => {
    const { t } = useTranslation()

    return (
        <ActivityList
            title={title}
            activities={activities}
            loading={loading}
            compact={compact}
            scrollable={scrollable}
            hidePlaceName={hidePlaceName}
            hideCover={hideCover}
            actionHref={actionHref}
            actionLabel={actionLabel}
            actionTitle={actionTitle}
            footer={
                onShowMore && hasMore ? (
                    <Button
                        mode={'secondary'}
                        stretched={true}
                        disabled={loadingMore}
                        loading={loadingMore}
                        onClick={onShowMore}
                    >
                        {t('show-more')}
                    </Button>
                ) : undefined
            }
        />
    )
}
