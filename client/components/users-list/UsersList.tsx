import Image from 'next/image'
import React from 'react'

import Container from '@/ui/container'
import Progress from '@/ui/progress'

import { User } from '@/api/types/User'

import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'
import styles from '@/components/users-list/styles.module.sass'

import { formatDate } from '@/functions/helpers'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

interface UsersListProps {
    users?: User[]
}

const UsersList: React.FC<UsersListProps> = ({ users }) => (
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
                    caption={formatDate(user?.created?.date, 'D MMMM YYYY')}
                />
                <div className={styles.reputation}>
                    <p>{'Репутация: '}</p>
                    <Reputation value={user?.reputation || 0} />
                </div>
                <div className={styles.level}>
                    [<b>{user?.level?.level}</b>]
                    <Image
                        className={styles.levelImage}
                        src={levelImage(user?.level?.level)?.src}
                        alt={''}
                        width={20}
                        height={20}
                    />
                    {user?.level?.title}
                    <Progress
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

export default UsersList
