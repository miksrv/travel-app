import React from 'react'
import { TFunction } from 'i18next'
import Image from 'next/image'

import { User } from '@/api/types/User'
import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'
import styles from '@/components/users-list/styles.module.sass'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'
import Container, { ContainerProps } from '@/ui/container'
import Progress from '@/ui/progress'

interface UsersListProps extends Pick<ContainerProps, 'title' | 'footer' | 'action'> {
    t: TFunction
    users?: User[]
}

const UsersList: React.FC<UsersListProps> = ({ t, users, ...props }) =>
    users?.length ? (
        <Container {...props}>
            {users.map((user) => (
                <div
                    key={user.id}
                    className={styles.usersListItem}
                >
                    <UserAvatar
                        showName={true}
                        user={user}
                        size={'medium'}
                        caption={
                            <>
                                <Image
                                    className={styles.levelImage}
                                    src={levelImage(user.levelData?.level).src}
                                    alt={''}
                                    width={16}
                                    height={16}
                                />
                                {user.levelData?.level} {t('level')}
                            </>
                        }
                    />

                    <div className={styles.metaContainer}>
                        <Reputation value={user.reputation || 0} />

                        <div className={styles.level}>
                            <p>{user.levelData?.title}</p>
                            <Progress
                                className={styles.progress}
                                value={nextLevelPercentage(
                                    user.levelData?.experience || 0,
                                    user.levelData?.nextLevel || user.levelData?.experience || 0
                                )}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </Container>
    ) : (
        <Container className={'emptyList'}>{t('nothing-here-yet')}</Container>
    )

export default UsersList
