import React, { useEffect, useState } from 'react'
import { Button } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { API, ApiModel } from '@/api'
import { ActivityList } from '@/components/shared'

const ACTIVITY_LIMIT = 10

interface PlaceActivityProps {
    placeId?: string
    hidePlaceName?: boolean
    hideCover?: boolean
}

export const PlaceActivity: React.FC<PlaceActivityProps> = ({ placeId, hidePlaceName, hideCover }) => {
    const { t } = useTranslation()

    const [offset, setOffset] = useState(0)
    const [allItems, setAllItems] = useState<ApiModel.Activity[]>([])

    const { data, isLoading, isFetching } = API.useActivityGetListQuery(
        { place: placeId, limit: ACTIVITY_LIMIT, offset },
        { skip: !placeId }
    )

    useEffect(() => {
        if (data?.items) {
            setAllItems((prev) => (offset === 0 ? data.items : [...prev, ...data.items]))
        }
    }, [data])

    if (!isLoading && !allItems.length) {
        return null
    }

    return (
        <ActivityList
            title={t('activity')}
            activities={allItems}
            loading={isLoading}
            compact={true}
            hidePlaceName={hidePlaceName}
            hideCover={hideCover}
            footer={
                data?.has_more ? (
                    <Button
                        mode={'secondary'}
                        stretched={true}
                        disabled={isFetching}
                        loading={isFetching}
                        onClick={() => setOffset((prev) => prev + ACTIVITY_LIMIT)}
                    >
                        {t('show-more')}
                    </Button>
                ) : undefined
            }
        />
    )
}
