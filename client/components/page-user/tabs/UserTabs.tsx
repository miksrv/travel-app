import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'

import { User } from '@/api/types/User'
import Tabs from '@/ui/tabs'

export enum UserPagesEnum {
    FEED = 'feed',
    PLACES = 'places',
    BOOKMARKS = 'bookmarks',
    PHOTOS = 'photos'
}

interface UserTabsProps {
    user?: User
    currentPage?: UserPagesEnum
}

const UserTabs: React.FC<UserTabsProps> = ({ user, currentPage }) => {
    const router = useRouter()
    const { t } = useTranslation()

    const [page, setPage] = useState<UserPagesEnum | undefined>(currentPage)

    useEffect(() => {
        if (page) {
            router.push(`/users/${user?.id}${page === UserPagesEnum.FEED ? '' : `/${page}`}`)
        }
    }, [page])

    return (
        <Tabs<UserPagesEnum>
            tabs={[
                { key: UserPagesEnum.FEED, label: t('activity-feed') },
                { key: UserPagesEnum.PLACES, label: t('geotags') },
                { key: UserPagesEnum.BOOKMARKS, label: t('favorites') },
                { key: UserPagesEnum.PHOTOS, label: t('photos') }
            ]}
            activeTab={page}
            onChangeTab={setPage}
        />
    )
}

export default UserTabs
