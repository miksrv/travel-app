import React from 'react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import { User } from '@/api/types/User'
import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'
import styles from '@/components/users-list/styles.module.sass'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'
import Container, { ContainerProps } from '@/ui/container'
import Progress from '@/ui/progress'

interface UsersListProps extends Pick<ContainerProps, 'title' | 'footer' | 'action'> {
    users?: User[]
}

const KEY = 'components.userList.'

const UsersList: React.FC<UsersListProps> = ({ users, ...props }) => {
    const { t } = useTranslation()

    return users?.length ? (
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
                                {user.levelData?.level} {t(`${KEY}level`)}
                            </>
                        }
                    />

                    <div className={styles.reputation}>
                        <p>{`${t(`${KEY}reputation`)}: `}</p>
                        <Reputation value={user.reputation || 0} />
                    </div>

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
            ))}
        </Container>
    ) : (
        <Container className={styles.emptyList}>{t(`${KEY}emptyList`)}</Container>
    )
}

export default UsersList
