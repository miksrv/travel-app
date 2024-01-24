import Image from 'next/image'
import React from 'react'

import Progress from '@/ui/progress'

import { User } from '@/api/types/User'

import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

import styles from './styles.module.sass'

interface UsersListItemProps {
    user: User
}

const UsersListItem: React.FC<UsersListItemProps> = ({ user }) => (
    <section className={styles.usersListItem}>
        <UserAvatar
            user={user}
            size={'medium'}
            showName={true}
            caption={formatDate(user?.created?.date, 'D MMMM YYYY')}
        />
        <Reputation value={user?.reputation || 0} />
        <div>
            [<b>{user?.level?.level}</b>] {user?.level?.title}
            <Image
                className={styles.levelImage}
                src={levelImage(user?.level?.level)?.src}
                alt={''}
                width={20}
                height={20}
            />
            <Progress
                value={nextLevelPercentage(
                    user?.level?.experience || 0,
                    user?.level?.nextLevel || user?.level?.experience || 0
                )}
            />
        </div>
    </section>
)

export default UsersListItem
