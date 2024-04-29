import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useState } from 'react'

import Tabs from '@/ui/tabs'

import { User } from '@/api/types/User'

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
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pageUser.userHeader'
    })

    const router = useRouter()

    const [page, setPage] = useState<UserPagesEnum | undefined>(currentPage)

    useEffect(() => {
        if (page) {
            router.push(
                `/users/${user?.id}${
                    page === UserPagesEnum.FEED ? '' : `/${page}`
                }`
            )
        }
    }, [page])

    return (
        <Tabs<UserPagesEnum>
            tabs={[
                { key: UserPagesEnum.FEED, label: 'Лента' },
                { key: UserPagesEnum.PLACES, label: 'Геометки' },
                { key: UserPagesEnum.BOOKMARKS, label: 'Избранное' },
                { key: UserPagesEnum.PHOTOS, label: 'Фотографии' }
            ]}
            activeTab={page}
            onChangeTab={setPage}
        />
    )
}

export default UserTabs
