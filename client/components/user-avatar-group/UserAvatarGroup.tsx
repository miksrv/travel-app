import { Trans } from 'next-i18next'
import React from 'react'

import { User } from '@/api/types/User'

import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface UserAvatarGroupProps {
    users?: User[]
    totalCount?: number
    className?: string
}

const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({
    users,
    totalCount,
    className
}) => (
    <div className={cn(styles.avatarsGroup, className)}>
        {users?.map((user) => (
            <UserAvatar
                key={`avatar${user.id}`}
                size={'tiny'}
                user={user}
            />
        ))}

        {totalCount && totalCount <= 99 ? (
            <div className={styles.totalCountAvatar}>{`+${totalCount}`}</div>
        ) : (
            ''
        )}

        {totalCount && totalCount > 99 ? (
            <>
                <div className={styles.totalCountText}>
                    <Trans
                        i18nKey={'components.userAvatarGroup.totalUsers'}
                        values={{ count: totalCount }}
                    />
                </div>
                <div className={styles.mobileCount}>{`+${totalCount}`}</div>
            </>
        ) : (
            ''
        )}
    </div>
)

export default UserAvatarGroup
