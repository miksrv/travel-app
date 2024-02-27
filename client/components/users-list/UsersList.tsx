import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React from 'react'

import Container from '@/ui/container'
import Progress from '@/ui/progress'

import { User } from '@/api/types/User'

import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'
import styles from '@/components/users-list/styles.module.sass'

import { timeAgo } from '@/functions/helpers'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

interface UsersListProps {
    users?: User[]
}

const UsersList: React.FC<UsersListProps> = ({ users }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userList'
    })

    return (
        <Container>
            {users?.map((user) => (
                <section
                    key={user.id}
                    className={styles.usersListItem}
                >
                    <UserAvatar
                        className={styles.avatar}
                        showName={true}
                        user={user}
                        size={'medium'}
                        caption={
                            <>
                                <Image
                                    className={styles.levelImage}
                                    src={levelImage(user?.level?.level)?.src}
                                    alt={''}
                                    width={16}
                                    height={16}
                                />
                                {user?.level?.level} {t('level')}
                            </>
                        }
                    />

                    <div className={styles.reputation}>
                        <p>{`${t('reputation')}: `}</p>
                        <Reputation value={user?.reputation || 0} />
                    </div>

                    <div className={styles.level}>
                        <p>{user?.level?.title}</p>
                        <Progress
                            className={styles.progress}
                            value={nextLevelPercentage(
                                user?.level?.experience || 0,
                                user?.level?.nextLevel ||
                                    user?.level?.experience ||
                                    0
                            )}
                        />
                    </div>
                </section>
            ))}
        </Container>
    )
}

export default UsersList
