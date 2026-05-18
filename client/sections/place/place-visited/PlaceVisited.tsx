import React from 'react'
import { Container } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { API, ApiModel } from '@/api'
import { UserAvatar } from '@/components/shared'

import styles from './styles.module.sass'

const MAX_AVATARS = 8

interface PlaceVisitedProps {
    place?: ApiModel.Place
}

export const PlaceVisited: React.FC<PlaceVisitedProps> = ({ place }) => {
    const { t } = useTranslation()

    const { data: visitedData } = API.useVisitedGetUsersListQuery(place?.id ?? '', {
        skip: !place?.id
    })

    const totalCount = visitedData?.total_count ?? 0
    const visibleUsers = visitedData?.items?.slice(0, MAX_AVATARS)

    if (totalCount === 0) {
        return null
    }

    return (
        <Container title={`${t('visited-here')} (${totalCount})`}>
            {!!visibleUsers?.length && (
                <div className={styles.avatarGrid}>
                    {visibleUsers.map((user) => (
                        <UserAvatar
                            key={user.id}
                            user={user}
                            size={'medium'}
                        />
                    ))}
                </div>
            )}
        </Container>
    )
}
